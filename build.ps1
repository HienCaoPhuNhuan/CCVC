param(
  [string]$Source = (Join-Path $PSScriptRoot '..\BÁO CÁO NH 25-26-PHƯƠNG HƯỚNG-26-27-rut gon.docx'),
  [string]$OldSlides = (Join-Path $PSScriptRoot '..\..\CMHS\slide\phu-nhuan-school-report-thu-nghiem')
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
$paragraphs[10] = 'Ban Giám hiệu gồm 01 Hiệu trưởng và 02 Phó hiệu trưởng.'
$paragraphs[40] = $paragraphs[40] -replace '^Tốt nghiệp:\s*100%\s*\(K12\)\s*', ''
$paragraphs[87] = 'Công đoàn: Hoàn thành xuất sắc nhiệm vụ'
$paragraphs[38] = $paragraphs[38] -replace '1\.691', '1.619'
$paragraphs[43] = '11 bài điểm 10 (Toán 6 bài, Lý 1 bài, Sử 2 bài, Tiếng Anh 2 bài).'
$paragraphs[51] = $paragraphs[51] -replace '\bHC\s+', 'huy chương ' -replace '(\d+)\s+(Vàng|Bạc|Đồng)', '$1 huy chương $2'
$paragraphs[56] = $paragraphs[56] -replace 'đồntg bào', 'đồng bào'
$paragraphs[114] = $paragraphs[114] -replace 'Công đoàn: Hoàn thành tốt nhiệm vụ', 'Công đoàn: Hoàn thành xuất sắc nhiệm vụ'
$paragraphs[21] = $paragraphs[21] -replace '^Về Đổi mới phương pháp dạy học:\s*', ''
$paragraphs[23] = $paragraphs[23] -replace '^Về Chuyển đổi số, học liệu số:\s*', ''
$paragraphs[101] = $paragraphs[101] -replace '^Hoạt động giáo dục Tăng cường:\s*', ''
$paragraphs[132] = $paragraphs[132] -replace '^[-\s]*Môi trường giáo dục:\s*', ''
$paragraphs[133] = $paragraphs[133] -replace '^[-\s]*Quản lý, Cải cách hành chính:\s*', ''
$paragraphs[134] = $paragraphs[134] -replace '^[-\s]*Cơ sở vật chất:\s*', ''
$assets = Join-Path $PSScriptRoot 'assets'
New-Item -ItemType Directory -Path $assets -Force | Out-Null
$reviewPath = Join-Path $PSScriptRoot 'review-media.json'
$review = if (Test-Path -LiteralPath $reviewPath) { Get-Content -LiteralPath $reviewPath -Raw -Encoding UTF8 | ConvertFrom-Json } else { $null }
$catalog = if (!$review) { Get-Content -LiteralPath (Join-Path $OldSlides 'assets/media/manifest.json') -Raw -Encoding UTF8 | ConvertFrom-Json } else { $null }
$slides = [Collections.Generic.List[object]]::new()
$mapping = [Collections.Generic.List[object]]::new()
function Slide($title, [int[]]$lines, [string[]]$photos = @(), $mode = '') {
  $number = $slides.Count + 1
  $images = @(if ($review) {
    foreach ($item in $review.slides[$number - 1].images) {
      if (!(Test-Path -LiteralPath (Join-Path $PSScriptRoot $item.src))) { throw "Missing reviewed image: $($item.src)" }
      $mapping.Add([ordered]@{number=$number; slide=$title; source=$item.source; asset=$item.src})
      $item.src
    }
  } else { foreach ($ref in $photos) {
    $section, $offset = $ref.Split(':')
    $item = $catalog.$section[[int]$offset]
    $file = if ($item.type -eq 'video') { $item.poster } else { $item.src }
    if (!$file) { throw "Missing photo: $ref" }
    $name = Split-Path $file -Leaf
    Copy-Item -LiteralPath (Join-Path $OldSlides $file) -Destination (Join-Path $assets $name)
    $mapping.Add([ordered]@{ slide = $title; source = $item.source; asset = "assets/$name" })
    "assets/$name"
  } })
  $body = @(foreach($line in $lines) {
    $text = $paragraphs[$line] -replace '^[-+]\s*',''
    if ($line -in @(114,115,117)) { ($text -split '(?<=\.)\s*(?=[2-5]\.\s)') -replace '^\d+\.\s*','' }
    elseif ($line -eq 122) { $text -split '(?<=\.)\s*(?=[2-5]\.\s)' }
    elseif ($line -in @(51,69,95,98,132,133,134)) { $text -split ';\s*' }
    elseif ($line -eq 76) { $text -split ', (?=tổ chức)| và (?=quyên góp)' }
    elseif ($line -eq 97) { $text -split '(?<=\.) (?=Đẩy mạnh)' }
    else { $text }
  })
  $body = @($body | ForEach-Object { $value = $_.Trim(); if ($value) { $value.Substring(0,1).ToUpper() + $value.Substring(1) } })
  $slides.Add([ordered]@{title=$title; body=$body; images=$images; mode=$mode; group=$group})
}
$group = 'Hội nghị Viên chức và Người lao động năm học 2026 - 2027'
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
$charity = $slides[$slides.Count - 1]
$charity['mode'] = 'bullet-points'
$charity['intro'] = ($paragraphs[56] -split ':', 2)[0] + ':'
$charity['body'] = @($paragraphs[55]) + @(
  foreach ($point in (($paragraphs[56] -split ':', 2)[1] -split ', (?=quyên góp|xây dựng|thăm tặng)')) {
    $point = $point.Trim().TrimEnd('.')
    $point.Substring(0,1).ToUpper() + $point.Substring(1) + '.'
  }
)
Slide 'Thắp sáng ước mơ tuổi trẻ Việt Nam' @(57) @('11:0','15:0')
$outreach = $slides[$slides.Count - 1]
$outreach['mode'] = 'bullet-points'
$outreach['body'] = @($paragraphs[57] -split ', (?=Tham gia)')
Slide 'Thành tích Đoàn Thanh niên' (60..63) @('03:0')
Slide 'Thành tích Đoàn Thanh niên' (64,65,67) @()
Slide 'Câu lạc bộ và hướng nghiệp' @(69) @('07:0','06:0')
Slide 'Thành tích câu lạc bộ' (71..73) @('07:5','07:6','07:1')
Slide 'Hoạt động Công đoàn' (76..78) @('03:1')
Slide 'Danh hiệu tập thể sư phạm' (81..85) @()
Slide 'Kết quả thi đua các tổ chức' (86..88) @()
$group = 'PHƯƠNG HƯỚNG · 2026–2027'
Slide 'Chủ đề năm học 2026 - 2027' @(91) @() 'chapter'
Slide 'Quy mô năm học mới' (93..94) @()
Slide 'Định hướng chiến lược' @(95) @()
Slide 'Đổi mới giảng dạy và chuyển đổi số' @(97) @('37:3')
Slide 'STEM và không gian học tập mở' @(98) @('39:0')
Slide 'Đổi mới kiểm tra đánh giá' @(99) @('38:0')
Slide 'Hoạt động giáo dục tăng cường' @(101)
Slide 'Hoạt động giáo dục theo nhu cầu' (103..105) @('40:0')
Slide 'AI, nghệ thuật và kỹ năng sống' (106..108) @('07:8')
Slide 'Chỉ tiêu thi đua tập thể và cá nhân' (114,115,117)
Slide 'Chỉ tiêu học tập và rèn luyện' (119..124) @() 'targets-table'
Slide 'Chỉ tiêu tốt nghiệp và các kỳ thi' (126,127,129)
Slide 'Môi trường và quản lý giáo dục' (132..133) @()
Slide 'Cơ sở vật chất' @(134)
Slide 'Đổi mới tư duy · Chuyển biến mạnh mẽ · Kết quả thực chất' @() @('47:0') 'closing'
$fixed = @{ cover = 5.0; closing = 8.0; chapter = 10.0 }
$voicePath = Join-Path $PSScriptRoot 'voice/manifest.json'
$voice = if (Test-Path -LiteralPath $voicePath) { Get-Content -LiteralPath $voicePath -Raw -Encoding UTF8 | ConvertFrom-Json } else { $null }
$voiceReady = $voice -and @($voice.slides.PSObject.Properties).Count -eq $slides.Count
$baseTotal = 0.0
$weights = @()
$bases = @()
for ($i = 0; $i -lt $slides.Count; $i++) {
  $slide = $slides[$i]
  $weight = if ($fixed.ContainsKey($slide.mode)) { 0 } else { (((@($slide.intro) + @($slide.body)) -join ' ').Trim() -split '\s+').Count }
  if ($voiceReady) {
    $track = $voice.slides.PSObject.Properties[[string]($i + 1)].Value
    if (!$track) { throw "Missing voice for slide $($i + 1)" }
    $slide['voice'] = $track.src
    $slide['voiceDuration'] = $track.duration
    $weight = $track.duration
    $photoCount = if ($slide.mode -in @('cover','closing')) { 0 } else { $slide.images.Count }
    $base = [math]::Max($track.duration + 0.5, 4 + 1.8 * $photoCount)
  } else {
    $base = if ($fixed.ContainsKey($slide.mode)) { $fixed[$slide.mode] } else { [math]::Max(10, 4 + 1.6 * $slide.images.Count) }
  }
  $weights += $weight
  $base = [math]::Ceiling(10 * $base) / 10
  $bases += $base
  $baseTotal += $base
}
$weightTotal = ($weights | Measure-Object -Sum).Sum
$targetSeconds = 600.0
$remainingTicks = 6000 - [int][math]::Round(10 * $baseTotal)
if ($remainingTicks -lt 0) { throw 'The voice and image minimums exceed 10 minutes. Review the photo count or narration before rebuilding.' }
$shares = @(for ($i = 0; $i -lt $slides.Count; $i++) {
  $share = $remainingTicks * $weights[$i] / $weightTotal
  [pscustomobject]@{Index=$i; Ticks=[int][math]::Floor($share); Remainder=$share - [math]::Floor($share)}
})
$roundingTicks = $remainingTicks - [int](($shares | Measure-Object -Property Ticks -Sum).Sum)
# Largest remainders preserve each minimum and make the schedule exactly 600 seconds.
@($shares | Sort-Object -Property @{Expression='Remainder';Descending=$true},Index | Select-Object -First $roundingTicks) | ForEach-Object { $_.Ticks++ }
for ($i = 0; $i -lt $slides.Count; $i++) {
  $slides[$i]['durationSeconds'] = [math]::Round($bases[$i] + $shares[$i].Ticks / 10.0, 1)
}
$offset = 0.0
$timeline = @(foreach ($slide in $slides) {
  $photoCount = if ($slide.mode -in @('cover','closing')) { 0 } else { $slide.images.Count }
  [ordered]@{ title = $slide.title; startSeconds = [math]::Round($offset, 1); durationSeconds = $slide.durationSeconds; imageCount=$photoCount; contentSeconds=4; secondsPerImage=$(if ($photoCount) { [math]::Round(($slide.durationSeconds - 4) / $photoCount, 3) } else { 0 }) }
  $offset += $slide.durationSeconds
})
$utf8 = [Text.UTF8Encoding]::new($false)
[IO.File]::WriteAllText((Join-Path $PSScriptRoot 'data.js'), ('window.ccvcSlides = ' + (ConvertTo-Json -InputObject @($slides.ToArray()) -Depth 8) + ';'),$utf8)
[IO.File]::WriteAllText((Join-Path $PSScriptRoot 'photo-map.json'), (ConvertTo-Json -InputObject @($mapping.ToArray()) -Depth 5),$utf8)
[IO.File]::WriteAllText((Join-Path $PSScriptRoot 'timeline.json'), (ConvertTo-Json -InputObject ([ordered]@{totalSeconds=$targetSeconds; voiceReady=[bool]$voiceReady; slides=$timeline}) -Depth 5),$utf8)
