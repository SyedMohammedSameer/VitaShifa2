"use client"

import type React from "react"
import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Upload, X, Eye, AlertCircle, CheckCircle, Clock, FileImage, Scan, Brain } from "lucide-react"
import { cn } from "@/lib/utils"

interface UploadedImage {
  id: string
  file: File
  preview: string
  analysis?: AnalysisResult
  status: "uploading" | "analyzing" | "completed" | "error"
}

interface AnalysisResult {
  confidence: number
  findings: string[]
  recommendations: string[]
  urgency: "low" | "medium" | "high"
  disclaimer: string
}

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};

export function AIDiagnosis() {
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([])
  const [isDragOver, setIsDragOver] = useState(false)

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    const files = Array.from(e.dataTransfer.files).filter((file) => file.type.startsWith("image/"))
    handleFiles(files)
  }, [])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    handleFiles(files)
  }

  const handleFiles = (files: File[]) => {
    files.forEach(async (file) => {
      const id = Date.now().toString() + Math.random().toString(36).substr(2, 9)
      const preview = URL.createObjectURL(file)

      const newImage: UploadedImage = {
        id,
        file,
        preview,
        status: "uploading", // We'll keep this state for user feedback
      }

      setUploadedImages((prev) => [...prev, newImage]);
      
      // We can change the status to "analyzing" right away
      setUploadedImages((prev) => prev.map((img) => (img.id === id ? { ...img, status: "analyzing" } : img)));

      try {
        // 1. Convert the file to a Base64 string
        const base64Image = await fileToBase64(file);

        // 2. Call your backend API with the Base64 string
        const response = await fetch('/api/ai-diagnosis', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ image: base64Image }), // Send the base64 string
        });

        if (!response.ok) {
            throw new Error('Analysis failed');
        }
        const analysis: AnalysisResult = await response.json();

        // 3. Update state with the analysis result
        setUploadedImages((prev) =>
            prev.map((img) => (img.id === id ? { ...img, status: "completed", analysis } : img)),
        )
      } catch (error) {
          console.error(error);
          setUploadedImages((prev) => prev.map((img) => (img.id === id ? { ...img, status: "error" } : img)))
      }
    })
  }

  const removeImage = (id: string) => {
    setUploadedImages((prev) => {
      const image = prev.find((img) => img.id === id)
      if (image) {
        URL.revokeObjectURL(image.preview)
      }
      return prev.filter((img) => img.id !== id)
    })
  }

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case "high":
        return "destructive"
      case "medium":
        return "secondary"
      default:
        return "outline"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "uploading":
        return <Clock className="h-4 w-4" />
      case "analyzing":
        return <Brain className="h-4 w-4 animate-pulse" />
      case "completed":
        return <CheckCircle className="h-4 w-4" />
      case "error":
        return <AlertCircle className="h-4 w-4" />
      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary/10">
          <Scan className="h-5 w-5 text-secondary" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold text-foreground">AI Medical Image Analysis</h1>
          <p className="text-muted-foreground">Upload medical images for AI-powered analysis and insights</p>
        </div>
      </div>

      {/* Upload Area */}
      <Card className="bg-card/50 backdrop-blur-sm border-border/50">
        <CardContent className="p-6">
          <div
            className={cn(
              "border-2 border-dashed rounded-xl p-8 text-center transition-colors",
              isDragOver ? "border-primary bg-primary/5" : "border-border hover:border-primary/50 hover:bg-primary/5",
            )}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <div className="flex flex-col items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <Upload className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-foreground">Upload Medical Images</h3>
                <p className="text-muted-foreground mt-1">Drag and drop your images here, or click to browse</p>
              </div>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
                id="file-upload"
              />
              <Button asChild className="mt-2">
                <label htmlFor="file-upload" className="cursor-pointer">
                  <FileImage className="h-4 w-4 mr-2" />
                  Choose Images
                </label>
              </Button>
              <p className="text-xs text-muted-foreground">Supports: JPG, PNG, DICOM • Max size: 10MB per image</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Uploaded Images */}
      {uploadedImages.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-medium text-foreground">Analysis Results</h2>

          {uploadedImages.map((image) => (
            <Card key={image.id} className="bg-card/50 backdrop-blur-sm border-border/50">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    {getStatusIcon(image.status)}
                    {image.file.name}
                  </CardTitle>
                  <Button variant="ghost" size="icon" onClick={() => removeImage(image.id)} className="h-8 w-8">
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="flex gap-4">
                  {/* Image Preview */}
                  <div className="flex-shrink-0">
                    <div className="relative w-24 h-24 rounded-lg overflow-hidden bg-muted">
                      <img
                        src={image.preview || "/placeholder.svg"}
                        alt="Medical image preview"
                        className="w-full h-full object-cover"
                      />
                      <Button variant="secondary" size="icon" className="absolute top-1 right-1 h-6 w-6">
                        <Eye className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>

                  {/* Analysis Content */}
                  <div className="flex-1 space-y-3">
                    {image.status === "uploading" && (
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">Uploading image...</p>
                        <Progress value={75} className="h-2" />
                      </div>
                    )}

                    {image.status === "analyzing" && (
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">AI is analyzing your image...</p>
                        <Progress value={45} className="h-2" />
                      </div>
                    )}

                    {image.status === "completed" && image.analysis && (
                      <div className="space-y-4">
                        <div className="flex items-center gap-2">
                          <Badge variant={getUrgencyColor(image.analysis.urgency)}>
                            {image.analysis.urgency.toUpperCase()} PRIORITY
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            Confidence: {image.analysis.confidence}%
                          </span>
                        </div>

                        <div>
                          <h4 className="font-medium text-foreground mb-2">Key Findings</h4>
                          <ul className="space-y-1">
                            {image.analysis.findings.map((finding, index) => (
                              <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                                <CheckCircle className="h-3 w-3 text-primary mt-0.5 flex-shrink-0" />
                                {finding}
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div>
                          <h4 className="font-medium text-foreground mb-2">Recommendations</h4>
                          <ul className="space-y-1">
                            {image.analysis.recommendations.map((rec, index) => (
                              <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                                <AlertCircle className="h-3 w-3 text-secondary mt-0.5 flex-shrink-0" />
                                {rec}
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div className="bg-muted/50 rounded-lg p-3">
                          <p className="text-xs text-muted-foreground">
                            <strong>Medical Disclaimer:</strong> {image.analysis.disclaimer}
                          </p>
                        </div>
                      </div>
                    )}

                    {image.status === "error" && (
                      <div className="text-destructive text-sm">Error analyzing image. Please try again.</div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Information Cards */}
      <div className="grid md:grid-cols-2 gap-4">
        <Card className="bg-card/50 backdrop-blur-sm border-border/50">
          <CardHeader>
            <CardTitle className="text-base">Supported Image Types</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="text-sm text-muted-foreground">• X-rays and radiographs</div>
            <div className="text-sm text-muted-foreground">• MRI and CT scans</div>
            <div className="text-sm text-muted-foreground">• Dermatological images</div>
            <div className="text-sm text-muted-foreground">• Pathology slides</div>
          </CardContent>
        </Card>

        <Card className="bg-card/50 backdrop-blur-sm border-border/50">
          <CardHeader>
            <CardTitle className="text-base">Privacy & Security</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="text-sm text-muted-foreground">• Images are encrypted during upload</div>
            <div className="text-sm text-muted-foreground">• Analysis is performed securely</div>
            <div className="text-sm text-muted-foreground">• Data is not stored permanently</div>
            <div className="text-sm text-muted-foreground">• HIPAA compliant processing</div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}