$ErrorActionPreference = 'Stop'
$root = 'C:\Users\MI COMPUTERS\Desktop\a25\forma-online-clothing-store'
$desktopImage = Join-Path $root 'project-diary-checkout-desktop.png'
$mobileImage = Join-Path $root 'project-diary-checkout-mobile.png'
$outputPath = Join-Path $root 'Forma-Checkout-Project-Diary.docx'

if (!(Test-Path $desktopImage) -or !(Test-Path $mobileImage)) {
  throw 'Screenshot files are missing.'
}

$word = $null
$document = $null
try {
  $word = New-Object -ComObject Word.Application
  $word.Visible = $false
  $word.DisplayAlerts = 0
  $document = $word.Documents.Add()
  $document.PageSetup.TopMargin = $word.InchesToPoints(0.65)
  $document.PageSetup.BottomMargin = $word.InchesToPoints(0.65)
  $document.PageSetup.LeftMargin = $word.InchesToPoints(0.7)
  $document.PageSetup.RightMargin = $word.InchesToPoints(0.7)
  $selection = $word.Selection

  $selection.Style = $document.Styles.Item('Title')
  $selection.TypeText('FORMA | Project Diary')
  $selection.TypeParagraph()
  $selection.Style = $document.Styles.Item('Subtitle')
  $selection.TypeText('PayHere Sandbox Checkout Integration')
  $selection.TypeParagraph()
  $selection.Style = $document.Styles.Item('Normal')
  $selection.TypeText('Date: 02 October 2026')
  $selection.TypeParagraph()
  $selection.TypeText('Project stack: Next.js 16 / React 19 frontend with Node.js / Express backend')
  $selection.TypeParagraph()
  $selection.TypeText('Project goal: Add a secure, responsive checkout and PayHere Sandbox payment flow without changing the FORMA design language.')
  $selection.TypeParagraph()
  $selection.TypeParagraph()

  $selection.Style = $document.Styles.Item('Heading 1')
  $selection.TypeText('Diary Entry')
  $selection.TypeParagraph()
  $entries = @(
    @{ Title = '01  Cart and storefront integration'; Body = 'Connected the existing product cards and cart drawer to checkout. Cart lines retain product slug, selected color, size, and quantity in sessionStorage; quantity changes and item removal remain available. Existing Checkout actions now lead to the new checkout route.' },
    @{ Title = '02  Responsive checkout experience'; Body = 'Added a two-column desktop checkout with a customer form and order summary, collapsing to one column on mobile. The form includes Sri Lankan address fields, accessible inline validation, a fixed Sri Lanka country field, a configurable LKR 350 delivery fee, and a disabled Pay button until valid.' },
    @{ Title = '03  Server-side PayHere order creation'; Body = 'Express recalculates item prices from Backend/data/products.json, validates customer and variant data, persists a pending order, formats the amount to exactly two decimals, and generates the required uppercase MD5 hash. The browser receives checkout fields and hash only; the merchant secret stays on the backend.' },
    @{ Title = '04  Payment notification and result routes'; Body = 'Added the PayHere notify endpoint, exact amount/currency checks, signature verification, and paid/failed order updates. The success route fetches status from the backend and polls while pending; the cancel route offers a return to cart.' },
    @{ Title = '05  Setup and safety'; Body = 'Added environment examples, ignored local secrets and order data, and documented the checkout-origin versus public-notification URL distinction. The class demo clarified domain registration and the need to serve over HTTP/HTTPS; its browser-side secret/hash pattern was not copied.' }
  )
  foreach ($entry in $entries) {
    $selection.Style = $document.Styles.Item('Heading 2')
    $selection.TypeText($entry.Title)
    $selection.TypeParagraph()
    $selection.Style = $document.Styles.Item('Normal')
    $selection.TypeText($entry.Body)
    $selection.TypeParagraph()
  }

  $selection.TypeParagraph()
  $selection.Style = $document.Styles.Item('Heading 1')
  $selection.TypeText('Verification')
  $selection.TypeParagraph()
  $checks = @(
    'Production frontend build completed successfully; checkout and payment result routes were generated.',
    'Frontend TypeScript check and focused ESLint checks passed.',
    'All 6 backend tests passed, including hash formulas, tampered-price rejection, validation, and exact callback amount matching.',
    'Isolated API exercise with fake credentials: invalid signature left an order pending; valid signature changed it to paid; merchant secret was absent from the response.',
    'Browser checks confirmed responsive layouts, form validity behavior, and all required hidden PayHere fields with amount formatted as 5300.00.'
  )
  foreach ($check in $checks) {
    $selection.Style = $document.Styles.Item('List Bullet')
    $selection.TypeText($check)
    $selection.TypeParagraph()
  }

  $selection.Style = $document.Styles.Item('Heading 1')
  $selection.TypeText('Remaining Sandbox Setup')
  $selection.TypeParagraph()
  $selection.Style = $document.Styles.Item('Normal')
  $selection.TypeText('A real Sandbox card transaction was not completed because PAYHERE_MERCHANT_ID, PAYHERE_MERCHANT_SECRET, and a public BASE_URL are not configured. Register the browser checkout origin in PayHere, set the backend credentials and public HTTPS notification tunnel in Backend/.env, then restart Express. The README links to PayHere official Sandbox card instructions.')
  $selection.TypeParagraph()
  $selection.InsertBreak(7)

  $selection.Style = $document.Styles.Item('Heading 1')
  $selection.TypeText('Screenshot 1 | Desktop Checkout')
  $selection.TypeParagraph()
  $selection.Style = $document.Styles.Item('Caption')
  $selection.TypeText('Customer form and order summary in the FORMA glass styling.')
  $selection.TypeParagraph()
  $picture = $selection.InlineShapes.AddPicture($desktopImage, $false, $true)
  $picture.LockAspectRatio = -1
  $picture.Width = $word.InchesToPoints(7.0)
  $selection.TypeParagraph()
  $selection.InsertBreak(7)

  $selection.Style = $document.Styles.Item('Heading 1')
  $selection.TypeText('Screenshot 2 | Mobile Checkout')
  $selection.TypeParagraph()
  $selection.Style = $document.Styles.Item('Caption')
  $selection.TypeText('Single-column responsive checkout at a 390-pixel viewport.')
  $selection.TypeParagraph()
  $picture = $selection.InlineShapes.AddPicture($mobileImage, $false, $true)
  $picture.LockAspectRatio = -1
  $picture.Width = $word.InchesToPoints(2.7)
  $selection.TypeParagraph()

  $document.SaveAs2($outputPath, 16)
  $document.Close(0)
  $document = $null
  Write-Output "Created $outputPath"
} finally {
  if ($document -ne $null) {
    $document.Close(0)
    [void][System.Runtime.InteropServices.Marshal]::ReleaseComObject($document)
  }
  if ($word -ne $null) {
    $word.Quit()
    [void][System.Runtime.InteropServices.Marshal]::ReleaseComObject($word)
  }
}
