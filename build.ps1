param(
  [string]$Source = (Join-Path $PSScriptRoot '..\..\..\CCVC\BÁO CÁO NH 25-26-PHƯƠNG HƯỚNG-26-27-rut gon.docx'),
  [string]$OldSlides = (Join-Path $PSScriptRoot '..\phu-nhuan-school-report-thu-nghiem')
)
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.IO.Compression.FileSystem
$zip = [IO.Compression.ZipFile]::OpenRead((Resolve-Path -LiteralPath $Source).Path)
try {
  $reader = [IO.StreamReader]::new($zip.GetEntry('word/document.xml').Open())
  try { [xml]$xml = $reader.ReadToEnd() } finally { $reader.Dispose() }
} finally { $zip.Dispose() }
$ns = [Xml.XmlNamespaceManager]::new($xml.NameTable)
$ns.AddNamespace('w','http://schemas.openxmlformats.org/wordprocessingml/2006/main')
$paragraphs = @('') + @(
  foreach ($p in $xml.SelectNodes('//w:body//w:p',$ns)) {
    $value = ($p.SelectNodes('.//w:t[not(ancestor::w:del)] | .//w:br | .//w:tab',$ns) | ForEach-Object {
      if ($_.LocalName -eq 't') { $_.InnerText } else { ' ' }
    }) -join ''
    if ($value.Trim()) { $value.Trim() }
  }
)
if ($paragraphs.Count -ne 137 -or $paragraphs[9] -notmatch '116' -or $paragraphs[134] -notmatch '100%') {
  throw 'The source outline has changed; review the paragraph mapping before rebuilding.'
}
# Approved corrections apply to the presentation without rewriting the source Word file.
$paragraphs[38] = $paragraphs[38] -replace '1\.691', '1.619'
$paragraphs[114] = $paragraphs[114] -replace 'Công đoàn: Hoàn thành tốt nhiệm vụ', 'Công đoàn: Hoàn thành xuất sắc nhiệm vụ'
$assets = Join-Path $PSScriptRoot 'assets'
New-Item -ItemType Directory -Path $assets -Force | Out-Null
$catalog = Get-Content -LiteralPath (Join-Path $OldSlides 'assets/media/manifest.json') -Raw -Encoding UTF8 | ConvertFrom-Json
$slides = [Collections.Generic.List[object]]::new()
$mapping = [Collections.Generic.List[object]]::new()
function Slide($title, [int[]]$lines, [string[]]$photos = @(), $mode = '') {
  $images = @(foreach ($ref in $photos) {
    $section, $offset = $ref.Split(':')
    $item = $catalog.$section[[int]$offset]
    $file = if ($item.type -eq 'video') { $item.poster } else { $item.src }
    if (!$file) { throw "Missing photo: $ref" }
    $name = Split-Path $file -Leaf
    Copy-Item -LiteralPath (Join-Path $OldSlides $file) -Destination (Join-Path $assets $name)
    $mapping.Add([ordered]@{ slide = $title; source = $item.source; asset = "assets/$name" })
    "assets/$name"
  })
  $body = @(foreach($line in $lines) {
    $text = $paragraphs[$line] -replace '^[-+]\s*',''
    if ($line -in @(114,115,117,122)) { $text -split '(?<=\.)\s*(?=[2-5]\.\s)' }
    else { $text }
  })
  $slides.Add([ordered]@{title=$title; body=$body; images=$images; mode=$mode; group=$group})
}
$group = 'HỘI NGHỊ CCVC'
Slide 'Trường THPT Phú Nhuận' @() @('00:0') 'cover'
$group = 'TỔNG KẾT · 2025–2026'
Slide 'Đội ngũ nhà trường' @(9,10) @('01:0','01:11')
Slide 'Quy mô và các tổ chức' @(12,13,15,16,17,19) @()
Slide 'Đổi mới phương pháp dạy học' @(21) @('05:37','05:38')
Slide 'Chuyển đổi số và học liệu số' @(23) @('37:2')
Slide 'Kết quả rèn luyện' (32..34) @() 'conduct-chart'
Slide 'Kết quả học tập' (36..38) @() 'learning-chart'
Slide 'Tốt nghiệp THPT và đại học' (40..43) @() 'graduation-chart'
Slide 'Thành tích các kỳ thi' (46..48) @()
Slide 'Thành tích Olympic' (49..50) @()
Slide 'Thành tích thể dục thể thao' @(51) @()
Slide 'Công tác xã hội và thiện nguyện' (55..56) @('10:0','12:0')
Slide 'Thắp sáng ước mơ tuổi trẻ Việt Nam' @(57) @('11:0','15:0')
Slide 'Thành tích Đoàn Thanh niên' (60..63) @('03:0')
Slide 'Thành tích Đoàn Thanh niên' (64,65,67) @()
Slide 'Câu lạc bộ và hướng nghiệp' @(69) @('07:0','06:0')
Slide 'Thành tích câu lạc bộ' (71..73) @('07:5','07:6','07:1')
Slide 'Hoạt động Công đoàn' (76..78) @('03:1')
Slide 'Danh hiệu tập thể sư phạm' (81..85) @()
Slide 'Kết quả thi đua các tổ chức' (86..88) @()
$group = 'PHƯƠNG HƯỚNG · 2026–2027'
Slide 'Chủ đề năm học' @(91) @() 'chapter'
Slide 'Quy mô năm học mới' (93..94) @()
Slide 'Định hướng chiến lược' @(95) @()
Slide 'Đổi mới giảng dạy và chuyển đổi số' @(97) @('37:3')
Slide 'STEM và không gian học tập mở' @(98) @('39:0')
Slide 'Đổi mới kiểm tra đánh giá' @(99) @('38:0')
Slide 'Hoạt động giáo dục tăng cường' @(101)
Slide 'Hoạt động giáo dục theo nhu cầu' (103..105) @('40:0')
Slide 'AI, nghệ thuật và kỹ năng sống' (106..108) @('07:8')
Slide 'Chỉ tiêu thi đua tập thể và cá nhân' (114,115,117)
Slide 'Chỉ tiêu học tập và rèn luyện' (119..124) @() 'results'
Slide 'Chỉ tiêu tốt nghiệp và các kỳ thi' (126,127,129,130)
Slide 'Môi trường và quản lý giáo dục' (132..133) @()
Slide 'Cơ sở vật chất' @(134)
Slide 'Đổi mới tư duy · Chuyển biến mạnh mẽ · Kết quả thực chất' @() @('47:0') 'closing'
$fixed = @{ cover = 5.0; closing = 8.0; chapter = 10.0 }
$baseTotal = 0.0
$weights = @()
$bases = @()
foreach ($slide in $slides) {
  $weight = if ($fixed.ContainsKey($slide.mode)) { 0 } else { ($slide.body -join ' ' -split '\s+').Count }
  $base = if ($fixed.ContainsKey($slide.mode)) { $fixed[$slide.mode] } else { [math]::Max(10, 4 + 4.5 * $slide.images.Count) }
  $weights += $weight
  $bases += $base
  $baseTotal += $base
}
$weightTotal = ($weights | Measure-Object -Sum).Sum
$assigned = 0.0
for ($i = 0; $i -lt $slides.Count; $i++) {
  $seconds = [math]::Floor(10 * ($bases[$i] + (600 - $baseTotal) * $weights[$i] / $weightTotal)) / 10
  $slides[$i]['durationSeconds'] = $seconds
  $assigned += $seconds
}
$slides[1]['durationSeconds'] = [math]::Round($slides[1]['durationSeconds'] + 600 - $assigned, 1)
$offset = 0.0
$timeline = @(foreach ($slide in $slides) {
  [ordered]@{ title = $slide.title; startSeconds = [math]::Round($offset, 1); durationSeconds = $slide.durationSeconds }
  $offset += $slide.durationSeconds
})
$utf8 = [Text.UTF8Encoding]::new($false)
[IO.File]::WriteAllText((Join-Path $PSScriptRoot 'data.js'), ('window.ccvcSlides = ' + (ConvertTo-Json -InputObject @($slides.ToArray()) -Depth 8) + ';'),$utf8)
[IO.File]::WriteAllText((Join-Path $PSScriptRoot 'photo-map.json'), (ConvertTo-Json -InputObject @($mapping.ToArray()) -Depth 5),$utf8)
[IO.File]::WriteAllText((Join-Path $PSScriptRoot 'timeline.json'), (ConvertTo-Json -InputObject ([ordered]@{totalSeconds=600; slides=$timeline}) -Depth 5),$utf8)
