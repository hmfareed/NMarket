Add-Type -AssemblyName System.Drawing

$darkLogo = [System.Drawing.Bitmap]::FromFile("c:\Projects\NMarket\public\logo-dark.png")
$bg = New-Object System.Drawing.Bitmap(500, 200)
$g = [System.Drawing.Graphics]::FromImage($bg)

# Background color of the dark sidebar (#0F1830 or #18191E)
$sidebarColor = [System.Drawing.ColorTranslator]::FromHtml("#0F1830")
$g.Clear($sidebarColor)

# Draw logo
$g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$targetH = 100
$targetW = [int]($darkLogo.Width * $targetH / $darkLogo.Height)
$x = [int]((500 - $targetW) / 2)
$y = [int]((200 - $targetH) / 2)

$g.DrawImage($darkLogo, $x, $y, $targetW, $targetH)

$g.Dispose()
$bg.Save("c:\Projects\NMarket\scratch\preview_dark_logo.png", [System.Drawing.Imaging.ImageFormat]::Png)
$bg.Dispose()
$darkLogo.Dispose()

Write-Host "Created preview_dark_logo.png"
