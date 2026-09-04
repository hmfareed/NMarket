Add-Type -AssemblyName System.Drawing

$inputPath = "c:\Projects\NMarket\public\logo.png"
$outputPath = "c:\Projects\NMarket\public\logo-transparent.png"
$darkOutputPath = "c:\Projects\NMarket\public\logo-dark.png"

$img = [System.Drawing.Bitmap]::FromFile($inputPath)
$width = $img.Width
$height = $img.Height

Write-Host "Image size: $width x $height"

# Create 32-bit ARGB bitmap
$transparentBmp = New-Object System.Drawing.Bitmap($width, $height, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$darkBmp = New-Object System.Drawing.Bitmap($width, $height, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)

for ($y = 0; $y -lt $height; $y++) {
    for ($x = 0; $x -lt $width; $x++) {
        $c = $img.GetPixel($x, $y)
        
        # Check if pixel is white or near-white background
        # Also smooth the boundary with alpha anti-aliasing
        $minRgb = [Math]::Min($c.R, [Math]::Min($c.G, $c.B))
        $maxRgb = [Math]::Max($c.R, [Math]::Max($c.G, $c.B))
        $diff = $maxRgb - $minRgb

        # If it is high brightness and low saturation, it is background white
        if ($c.R -gt 240 -and $c.G -gt 240 -and $c.B -gt 240) {
            # Completely transparent
            $transparentBmp.SetPixel($x, $y, [System.Drawing.Color]::FromArgb(0, 255, 255, 255))
            $darkBmp.SetPixel($x, $y, [System.Drawing.Color]::FromArgb(0, 255, 255, 255))
        }
        elseif ($c.R -gt 220 -and $c.G -gt 220 -and $c.B -gt 220 -and $diff -lt 15) {
            # Soft anti-aliased edge
            $alpha = [int](255 * (240 - $minRgb) / 20)
            if ($alpha -lt 0) { $alpha = 0 }
            if ($alpha -gt 255) { $alpha = 255 }
            
            $transparentBmp.SetPixel($x, $y, [System.Drawing.Color]::FromArgb($alpha, $c.R, $c.G, $c.B))
            $darkBmp.SetPixel($x, $y, [System.Drawing.Color]::FromArgb($alpha, 255, 255, 255))
        }
        else {
            # Original pixel for transparent logo
            $transparentBmp.SetPixel($x, $y, [System.Drawing.Color]::FromArgb(255, $c.R, $c.G, $c.B))
            
            # For dark mode version:
            # If the pixel is dark brown (e.g. R < 90, G < 60, B < 45) like the word "NORTHMARKET"
            # or the cart outline, turn it into crisp white or light ivory for extreme legibility
            # on the dark sidebar!
            if ($c.R -lt 100 -and $c.G -lt 80 -and $c.B -lt 60) {
                # Invert dark brown to bright crisp ivory/white text
                $darkBmp.SetPixel($x, $y, [System.Drawing.Color]::FromArgb(255, 255, 255, 255))
            }
            else {
                # Preserve the golden gradient of the 'N' and delivery box
                $darkBmp.SetPixel($x, $y, [System.Drawing.Color]::FromArgb(255, $c.R, $c.G, $c.B))
            }
        }
    }
}

$transparentBmp.Save($outputPath, [System.Drawing.Imaging.ImageFormat]::Png)
$darkBmp.Save($darkOutputPath, [System.Drawing.Imaging.ImageFormat]::Png)

$img.Dispose()
$transparentBmp.Dispose()
$darkBmp.Dispose()

Write-Host "Saved logo-transparent.png and logo-dark.png successfully!"
