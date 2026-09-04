Add-Type -AssemblyName System.Drawing

$inputPath = "c:\Projects\NMarket\public\logo.png"
$darkOutputPath = "c:\Projects\NMarket\public\logo-dark.png"
$lightOutputPath = "c:\Projects\NMarket\public\logo-transparent.png"

$img = [System.Drawing.Bitmap]::FromFile($inputPath)
$w = $img.Width
$h = $img.Height

$darkBmp = New-Object System.Drawing.Bitmap($w, $h, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$lightBmp = New-Object System.Drawing.Bitmap($w, $h, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)

for ($y = 0; $y -lt $h; $y++) {
    for ($x = 0; $x -lt $w; $x++) {
        $c = $img.GetPixel($x, $y)

        # Distance from pure white (255, 255, 255)
        $distFromWhite = [Math]::Sqrt([Math]::Pow(255 - $c.R, 2) + [Math]::Pow(255 - $c.G, 2) + [Math]::Pow(255 - $c.B, 2))

        if ($distFromWhite -lt 25) {
            # Completely transparent background
            $lightBmp.SetPixel($x, $y, [System.Drawing.Color]::FromArgb(0, 255, 255, 255))
            $darkBmp.SetPixel($x, $y, [System.Drawing.Color]::FromArgb(0, 255, 255, 255))
        }
        elseif ($distFromWhite -lt 55) {
            # Smooth anti-aliased edge
            $alpha = [int](255 * ($distFromWhite - 25) / 30)
            if ($alpha -gt 255) { $alpha = 255 }
            if ($alpha -lt 0) { $alpha = 0 }
            
            $lightBmp.SetPixel($x, $y, [System.Drawing.Color]::FromArgb($alpha, $c.R, $c.G, $c.B))
            
            # For dark mode edge:
            # Check if it's gold or dark brown
            if ($c.R -gt 140 -and $c.G -gt 90) {
                # Golden edge
                $darkBmp.SetPixel($x, $y, [System.Drawing.Color]::FromArgb($alpha, $c.R, $c.G, $c.B))
            } else {
                # White/light edge
                $darkBmp.SetPixel($x, $y, [System.Drawing.Color]::FromArgb($alpha, 255, 255, 255))
            }
        }
        else {
            # Solid pixel
            $lightBmp.SetPixel($x, $y, [System.Drawing.Color]::FromArgb(255, $c.R, $c.G, $c.B))

            # Is it golden? (Golden has high Red > 130, Green > 80, and Red > Blue + 50)
            if ($c.R -gt 130 -and $c.G -gt 80 -and ($c.R - $c.B) -gt 40) {
                # Keep original gorgeous gold gradient!
                $darkBmp.SetPixel($x, $y, [System.Drawing.Color]::FromArgb(255, $c.R, $c.G, $c.B))
            }
            else {
                # This is the dark brown part (left stem of 'N', shopping cart frame, wheels, and NORTHMARKET text)
                # In dark mode, convert to crisp brilliant white (#FFFFFF) with subtle warmth
                $darkBmp.SetPixel($x, $y, [System.Drawing.Color]::FromArgb(255, 255, 255, 255))
            }
        }
    }
}

$lightBmp.Save($lightOutputPath, [System.Drawing.Imaging.ImageFormat]::Png)
$darkBmp.Save($darkOutputPath, [System.Drawing.Imaging.ImageFormat]::Png)

$img.Dispose()
$lightBmp.Dispose()
$darkBmp.Dispose()

Write-Host "Generated crisp logo-transparent.png and logo-dark.png!"
