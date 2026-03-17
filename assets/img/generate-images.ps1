$ErrorActionPreference = "Stop"

$sourceDir = Join-Path $PSScriptRoot "raw"
$outputDir = Join-Path $PSScriptRoot "..\..\public\img"
$fullDir = Join-Path $outputDir "full"
$thumbDir = Join-Path $outputDir "thumbs"

New-Item -ItemType Directory -Force -Path $fullDir | Out-Null
New-Item -ItemType Directory -Force -Path $thumbDir | Out-Null

$files = Get-ChildItem -Path $sourceDir -File -Filter *.png

foreach ($file in $files) {
  $baseName = [System.IO.Path]::GetFileNameWithoutExtension($file.Name)
  $fullOutput = Join-Path $fullDir ($baseName + ".webp")
  $thumbOutput = Join-Path $thumbDir ($baseName + ".webp")

  ffmpeg -loglevel error -y -i $file.FullName -vf "scale=592:512:force_original_aspect_ratio=decrease" -frames:v 1 -c:v libwebp -lossless 0 -quality 85 -compression_level 6 -preset drawing $fullOutput
  ffmpeg -loglevel error -y -i $file.FullName -vf "scale=280:280:force_original_aspect_ratio=decrease" -frames:v 1 -c:v libwebp -lossless 0 -quality 80 -compression_level 6 -preset picture $thumbOutput
}

Write-Host "Generated optimized full and thumbnail images."
