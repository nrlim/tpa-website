'use client'

import { useState, useRef, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Upload, Download, FileText, CheckCircle2, AlertCircle, X, Eye } from 'lucide-react'
import JSZip from 'jszip'
import Papa from 'papaparse'
import { jsPDF } from 'jspdf'

// ─── Types ────────────────────────────────────────────────────────────────────
interface ParsedRow {
    name: string
    [key: string]: string
}

interface GenerationResult {
    name: string
    status: 'success' | 'error'
    error?: string
}

interface PreviewEntry {
    name: string
    index: number
}

// ─── SVG text positions (in viewBox units: 0 0 841.89 595.28) ────────────────
// The student name will be placed in the center of the certificate
// Based on the template's visual center for the recipient name
const NAME_X = 420.945 // center of 841.89
const NAME_Y = 355     // approximate Y position for recipient name

// ─── Canvas helper: render one certificate to a data URL ────────────────────
async function renderCertificate(
    svgContent: string,
    recipientName: string,
    canvas: HTMLCanvasElement
): Promise<string> {
    return new Promise((resolve, reject) => {
        const nameText = `
      <text
        text-anchor="middle"
        dominant-baseline="middle"
        transform="translate(${NAME_X} ${NAME_Y})"
        style="font-family: 'January Night', serif; font-size: 50px; font-weight: normal; fill: #3a2208; letter-spacing: 1px;"
      >
        <tspan x="0" y="0">${escapeXml(recipientName)}</tspan>
      </text>
    `

        // Find insertion point: before </g> that closes the st4 group (just before the text elements start)
        const insertionPoint = svgContent.lastIndexOf('</g>')
        const modifiedSvg =
            svgContent.slice(0, insertionPoint) +
            nameText +
            svgContent.slice(insertionPoint)

        const blob = new Blob([modifiedSvg], { type: 'image/svg+xml;charset=utf-8' })
        const url = URL.createObjectURL(blob)

        const img = new Image()
        img.onload = () => {
            canvas.width = 1122  // 841.89 * 1.333 ≈ A4 landscape 96dpi→px at ~1x
            canvas.height = 794

            const ctx = canvas.getContext('2d')!
            ctx.clearRect(0, 0, canvas.width, canvas.height)
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

            URL.revokeObjectURL(url)
            resolve(canvas.toDataURL('image/png', 0.95))
        }
        img.onerror = (e) => {
            URL.revokeObjectURL(url)
            reject(new Error(`Failed to render SVG for: ${recipientName}`))
        }
        img.src = url
    })
}

function escapeXml(unsafe: string): string {
    return unsafe
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;')
}

function dataUrlToBlob(dataUrl: string): Blob {
    const arr = dataUrl.split(',')
    const mime = arr[0].match(/:(.*?);/)![1]
    const bstr = atob(arr[1])
    let n = bstr.length
    const u8arr = new Uint8Array(n)
    while (n--) u8arr[n] = bstr.charCodeAt(n)
    return new Blob([u8arr], { type: mime })
}

// ─── Main component ──────────────────────────────────────────────────────────
export function CertificateGenerator() {
    const [names, setNames] = useState<ParsedRow[]>([])
    const [csvFile, setCsvFile] = useState<File | null>(null)
    const [csvError, setCsvError] = useState<string | null>(null)
    const [isGenerating, setIsGenerating] = useState(false)
    const [progress, setProgress] = useState(0)
    const [currentName, setCurrentName] = useState('')
    const [results, setResults] = useState<GenerationResult[]>([])
    const [downloadUrl, setDownloadUrl] = useState<string | null>(null)
    const [isDragging, setIsDragging] = useState(false)
    const [previewName, setPreviewName] = useState('')
    const [previewDataUrl, setPreviewDataUrl] = useState<string | null>(null)
    const [isPreviewing, setIsPreviewing] = useState(false)
    const [format, setFormat] = useState<'pdf' | 'png'>('pdf')

    const fileInputRef = useRef<HTMLInputElement>(null)
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const svgContentRef = useRef<string | null>(null)

    // ── Load SVG template once ───────────────────────────────────────────────
    const loadSvgTemplate = useCallback(async (): Promise<string> => {
        if (svgContentRef.current) return svgContentRef.current
        const res = await fetch('/certificate-template.svg')
        if (!res.ok) throw new Error('Gagal memuat template sertifikat.')
        let text = await res.text()

        // Load and embed custom font
        try {
            const fontRes = await fetch('/fonts/January%20Night.ttf')
            if (fontRes.ok) {
                const fontBuffer = await fontRes.arrayBuffer()
                const bytes = new Uint8Array(fontBuffer)
                let binary = ''
                for (let i = 0; i < bytes.byteLength; i++) {
                    binary += String.fromCharCode(bytes[i])
                }
                const base64Font = btoa(binary)
                
                const fontStyle = `
                <style>
                    @font-face {
                        font-family: 'January Night';
                        src: url('data:font/ttf;base64,${base64Font}') format('truetype');
                    }
                </style>`
                
                text = text.replace(/<svg[^>]*>/, (match) => match + fontStyle)
            }
        } catch (e) {
            console.warn("Gagal memuat font", e)
        }

        svgContentRef.current = text
        return text
    }, [])

    // ── CSV Parsing ──────────────────────────────────────────────────────────
    const parseCsv = useCallback((file: File) => {
        setCsvError(null)
        setNames([])
        setResults([])
        setDownloadUrl(null)

        Papa.parse<ParsedRow>(file, {
            header: true,
            skipEmptyLines: true,
            transformHeader: (h) => h.trim().toLowerCase(),
            complete: (result) => {
                // Abaikan error "UndetectableDelimiter" yang wajar terjadi pada CSV 1 kolom
                const criticalErrors = result.errors.filter(e => e.code !== 'UndetectableDelimiter')
                if (criticalErrors.length > 0) {
                    setCsvError(`Error parsing CSV: ${criticalErrors[0].message}`)
                    return
                }

                const rows = result.data as ParsedRow[]
                // Find the name column (name, nama, full_name, fullname, student_name, etc.)
                const nameKeys = ['name', 'nama', 'full_name', 'fullname', 'student_name', 'studentname', 'nama santri', 'nama_santri']
                const firstRow = rows[0] || {}
                const foundKey = nameKeys.find(k => k in firstRow)

                if (!foundKey) {
                    const keys = Object.keys(firstRow).join(', ')
                    setCsvError(`Kolom "name" atau "nama" tidak ditemukan. Kolom yang ada: ${keys}`)
                    return
                }

                const parsed = rows
                    .map(r => ({ ...r, name: (r[foundKey] || '').toString().trim() }))
                    .filter(r => r.name.length > 0)

                if (parsed.length === 0) {
                    setCsvError('Tidak ada nama yang valid di file CSV.')
                    return
                }

                setNames(parsed)
            },
            error: (err) => {
                setCsvError(`Gagal membaca file: ${err.message}`)
            }
        })
    }, [])

    const handleFileChange = useCallback((file: File | null) => {
        if (!file) return
        if (!file.name.endsWith('.csv')) {
            setCsvError('Hanya file .csv yang didukung.')
            return
        }
        setCsvFile(file)
        parseCsv(file)
    }, [parseCsv])

    // ── Drag & Drop ──────────────────────────────────────────────────────────
    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(false)
        const file = e.dataTransfer.files[0]
        handleFileChange(file)
    }, [handleFileChange])

    // ── Preview ──────────────────────────────────────────────────────────────
    const handlePreview = useCallback(async () => {
        const name = previewName.trim() || (names[0]?.name ?? 'Ahmad Fauzan')
        setIsPreviewing(true)
        try {
            const svg = await loadSvgTemplate()
            const canvas = canvasRef.current!
            const dataUrl = await renderCertificate(svg, name, canvas)
            setPreviewDataUrl(dataUrl)
        } catch (err: any) {
            setCsvError(err.message)
        } finally {
            setIsPreviewing(false)
        }
    }, [previewName, names, loadSvgTemplate])

    // ── Generate All ─────────────────────────────────────────────────────────
    const handleGenerate = useCallback(async () => {
        if (names.length === 0) return

        setIsGenerating(true)
        setProgress(0)
        setResults([])
        setDownloadUrl(null)

        try {
            const svg = await loadSvgTemplate()
            const canvas = canvasRef.current!
            const zip = new JSZip()
            const generationResults: GenerationResult[] = []

            for (let i = 0; i < names.length; i++) {
                const row = names[i]
                const name = row.name

                setCurrentName(name)
                setProgress(Math.round((i / names.length) * 100))

                try {
                    const dataUrl = await renderCertificate(svg, name, canvas)
                    const safeName = name.replace(/[^a-zA-Z0-9\s\-_]/g, '').replace(/\s+/g, '_')
                    
                    if (format === 'pdf') {
                        // A4 Landscape: 297 x 210 mm
                        const doc = new jsPDF({
                            orientation: 'landscape',
                            unit: 'mm',
                            format: 'a4'
                        })
                        
                        doc.addImage(dataUrl, 'PNG', 0, 0, 297, 210)
                        const pdfBlob = doc.output('blob')
                        zip.file(`sertifikat_${i + 1}_${safeName}.pdf`, pdfBlob)
                    } else {
                        const blob = dataUrlToBlob(dataUrl)
                        zip.file(`sertifikat_${i + 1}_${safeName}.png`, blob)
                    }
                    
                    generationResults.push({ name, status: 'success' })
                } catch (err: any) {
                    generationResults.push({ name, status: 'error', error: err.message })
                }

                // Small delay to let UI update
                await new Promise(r => setTimeout(r, 50))
            }

            setProgress(100)
            setCurrentName('')

            // Build ZIP
            const zipBlob = await zip.generateAsync({ type: 'blob', compression: 'DEFLATE', compressionOptions: { level: 6 } })
            const url = URL.createObjectURL(zipBlob)
            setDownloadUrl(url)
            setResults(generationResults)
        } catch (err: any) {
            setCsvError(`Terjadi kesalahan: ${err.message}`)
        } finally {
            setIsGenerating(false)
        }
    }, [names, loadSvgTemplate])

    const handleDownloadTemplate = useCallback(() => {
        const csvContent = "name\nAhmad Fauzan\nSiti Aisyah\nMuhammad Rizki\n"
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.setAttribute('href', url)
        link.setAttribute('download', 'template_sertifikat.csv')
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }, [])

    const successCount = results.filter(r => r.status === 'success').length
    const errorCount = results.filter(r => r.status === 'error').length

    return (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {/* Hidden canvas for rendering */}
            <canvas ref={canvasRef} style={{ display: 'none' }} />

            {/* ── LEFT COLUMN: Upload & Settings ──────────────────────────── */}
            <div className="lg:col-span-2 space-y-4">
                {/* Step 1: Upload Card */}
                <Card className="border-t-4 border-t-primary shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base flex items-center gap-2">
                            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">1</span>
                            Upload Data Santri
                        </CardTitle>
                        <CardDescription className="ml-8">
                            File CSV harus memiliki kolom <code className="font-mono text-xs bg-muted px-1 rounded">name</code> atau <code className="font-mono text-xs bg-muted px-1 rounded">nama</code>
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {/* Drop Zone */}
                        <div
                            className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 cursor-pointer ${
                                isDragging
                                    ? 'border-primary bg-primary/5 scale-[1.01]'
                                    : csvFile
                                    ? 'border-green-500/60 bg-green-500/5'
                                    : 'border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/30'
                            }`}
                            onClick={() => fileInputRef.current?.click()}
                            onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
                            onDragLeave={() => setIsDragging(false)}
                            onDrop={handleDrop}
                        >
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept=".csv"
                                className="hidden"
                                onChange={(e) => handleFileChange(e.target.files?.[0] ?? null)}
                            />
                            {csvFile ? (
                                <div className="flex flex-col items-center gap-2">
                                    <CheckCircle2 className="h-8 w-8 text-green-500" />
                                    <p className="font-medium text-sm text-foreground">{csvFile.name}</p>
                                    <p className="text-xs text-muted-foreground">{names.length} nama ditemukan</p>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center gap-2">
                                    <Upload className="h-8 w-8 text-muted-foreground/50" />
                                    <p className="text-sm font-medium">Klik atau drag & drop file CSV</p>
                                    <p className="text-xs text-muted-foreground">Format: .csv</p>
                                </div>
                            )}
                        </div>

                        {/* Error */}
                        {csvError && (
                            <div className="flex items-start gap-2 p-3 rounded-lg bg-destructive/10 text-destructive border border-destructive/20">
                                <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                                <p className="text-xs">{csvError}</p>
                            </div>
                        )}

                        {/* CSV Format hint */}
                        <div className="rounded-lg border bg-muted/30 p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <div>
                                <p className="text-xs font-medium text-muted-foreground mb-1">Contoh format CSV:</p>
                                <pre className="text-xs font-mono text-muted-foreground bg-background/50 p-2 rounded border">
{`name
Ahmad Fauzan
Siti Aisyah`}
                                </pre>
                            </div>
                            <Button variant="outline" size="sm" onClick={handleDownloadTemplate} className="text-xs h-9">
                                <Download className="h-3 w-3 mr-2" />
                                Unduh Template CSV
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Step 2: Preview Card */}
                <Card className="border-t-4 border-t-primary shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base flex items-center gap-2">
                            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">2</span>
                            Preview Sertifikat
                        </CardTitle>
                        <CardDescription className="ml-8">Lihat tampilan sertifikat sebelum proses generate</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div className="flex gap-2">
                            <input
                                type="text"
                                placeholder={names[0]?.name ?? 'Ahmad Fauzan'}
                                value={previewName}
                                onChange={(e) => setPreviewName(e.target.value)}
                                className="flex-1 h-9 px-3 rounded-md border border-input bg-background text-sm"
                            />
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={handlePreview}
                                disabled={isPreviewing}
                            >
                                {isPreviewing ? (
                                    <span className="flex items-center gap-1.5">
                                        <span className="h-3 w-3 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                                        Loading
                                    </span>
                                ) : 'Preview'}
                            </Button>
                        </div>
                        {previewDataUrl && (
                            <div className="rounded-lg overflow-hidden border shadow-sm">
                                <img
                                    src={previewDataUrl}
                                    alt="Certificate Preview"
                                    className="w-full h-auto"
                                />
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* ── RIGHT COLUMN: Generate & Results ────────────────────────── */}
            <div className="lg:col-span-3 space-y-4">
                {/* Step 3: Generate Card */}
                <Card className="border-t-4 border-t-primary shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base flex items-center gap-2">
                            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">3</span>
                            Generate & Unduh
                        </CardTitle>
                        <CardDescription className="ml-8">
                            {names.length > 0
                                ? `${names.length} sertifikat siap di-generate`
                                : 'Upload file CSV terlebih dahulu'}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {/* Name list preview */}
                        {names.length > 0 && (
                            <div className="max-h-40 overflow-y-auto rounded-lg border divide-y text-sm">
                                {names.slice(0, 10).map((row, i) => (
                                    <div key={i} className="px-3 py-1.5 flex items-center gap-2 hover:bg-muted/40">
                                        <span className="text-xs text-muted-foreground font-mono w-5">{i + 1}</span>
                                        <span>{row.name}</span>
                                    </div>
                                ))}
                                {names.length > 10 && (
                                    <div className="px-3 py-1.5 text-xs text-muted-foreground text-center">
                                        +{names.length - 10} nama lainnya
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Progress */}
                        {isGenerating && (
                            <div className="space-y-2">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-muted-foreground truncate max-w-[70%]">
                                        {currentName ? `Memproses: ${currentName}` : 'Mempersiapkan...'}
                                    </span>
                                    <span className="font-semibold text-primary">{progress}%</span>
                                </div>

                                {/* Progress bar */}
                                <div className="h-2.5 w-full rounded-full bg-muted overflow-hidden">
                                    <div
                                        className="h-full rounded-full bg-gradient-to-r from-primary/80 to-primary transition-all duration-300 ease-out relative"
                                        style={{ width: `${progress}%` }}
                                    >
                                        {/* Shimmer effect */}
                                        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
                                    </div>
                                </div>

                                <p className="text-xs text-muted-foreground text-center">
                                    {Math.round((progress / 100) * names.length)} / {names.length} sertifikat selesai
                                </p>
                            </div>
                        )}

                        {/* Actions */}
                        <div className="flex flex-col gap-3">
                            <div className="flex items-center gap-2 mb-1">
                                <span className="text-sm font-medium">Format Output:</span>
                                <select 
                                    value={format} 
                                    onChange={(e) => setFormat(e.target.value as 'png' | 'pdf')}
                                    className="h-8 px-2 rounded-md border bg-background text-sm"
                                    disabled={isGenerating}
                                >
                                    <option value="pdf">PDF (Direkomendasikan)</option>
                                    <option value="png">PNG (Gambar)</option>
                                </select>
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    className="flex-1"
                                    onClick={handleGenerate}
                                    disabled={names.length === 0 || isGenerating}
                                >
                                {isGenerating ? (
                                    <span className="flex items-center gap-2">
                                        <span className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                                        Generating {progress}%...
                                    </span>
                                ) : (
                                    <span className="flex items-center gap-2">
                                        <Download className="h-4 w-4" />
                                        Generate & Download ZIP
                                    </span>
                                )}
                            </Button>

                            {csvFile && (
                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => {
                                        setCsvFile(null)
                                        setNames([])
                                        setResults([])
                                        setDownloadUrl(null)
                                        setCsvError(null)
                                        setPreviewDataUrl(null)
                                        if (fileInputRef.current) fileInputRef.current.value = ''
                                    }}
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            )}
                        </div>
                        </div>

                        {/* Download link */}
                        {downloadUrl && (
                            <a
                                href={downloadUrl}
                                download={`sertifikat_${new Date().toISOString().slice(0, 10)}.zip`}
                                className="flex items-center justify-center gap-2 w-full rounded-lg border-2 border-green-500/50 bg-green-500/10 text-green-700 hover:bg-green-500/20 transition-colors px-4 py-3 font-medium text-sm"
                            >
                                <Download className="h-4 w-4" />
                                Unduh ZIP ({successCount} sertifikat)
                            </a>
                        )}
                    </CardContent>
                </Card>

                {/* Results Card */}
                {results.length > 0 && (
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base">Hasil Generate</CardTitle>
                            <CardDescription>
                                <span className="text-green-600 font-medium">{successCount} berhasil</span>
                                {errorCount > 0 && (
                                    <span className="text-destructive font-medium">, {errorCount} gagal</span>
                                )}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="max-h-72 overflow-y-auto divide-y text-sm">
                                {results.map((r, i) => (
                                    <div
                                        key={i}
                                        className={`px-4 py-2.5 flex items-center gap-3 ${
                                            r.status === 'error' ? 'bg-destructive/5' : 'hover:bg-muted/30'
                                        }`}
                                    >
                                        {r.status === 'success' ? (
                                            <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
                                        ) : (
                                            <AlertCircle className="h-4 w-4 text-destructive flex-shrink-0" />
                                        )}
                                        <span className={r.status === 'error' ? 'text-destructive' : ''}>
                                            {r.name}
                                        </span>
                                        {r.error && (
                                            <span className="ml-auto text-xs text-destructive/70 truncate max-w-[150px]">
                                                {r.error}
                                            </span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Info card */}
                <Card className="border-dashed bg-muted/20">
                    <CardContent className="pt-4">
                        <div className="space-y-1.5 text-xs text-muted-foreground">
                            <p className="font-medium text-foreground text-sm">📋 Petunjuk Penggunaan</p>
                            <ol className="list-decimal list-inside space-y-1 ml-1">
                                <li>Siapkan file CSV dengan kolom <code className="font-mono bg-muted px-1 rounded">name</code> (atau <code className="font-mono bg-muted px-1 rounded">nama</code>)</li>
                                <li>Upload file CSV menggunakan area drop di sebelah kiri</li>
                                <li>Gunakan fitur Preview untuk memeriksa tampilan sertifikat</li>
                                <li>Klik <strong>Generate & Download ZIP</strong> untuk memulai proses</li>
                                <li>Sertifikat akan dihasilkan dalam format pilihan (PDF/PNG) dan dikemas dalam ZIP</li>
                            </ol>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <style jsx global>{`
                @keyframes shimmer {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(200%); }
                }
                .animate-shimmer {
                    animation: shimmer 1.5s infinite;
                }
            `}</style>
        </div>
    )
}
