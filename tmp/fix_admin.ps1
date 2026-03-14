$c = Get-Content 'c:\Users\User\OneDrive\Desktop\ARQOVEX\src\app\admin\page.tsx'
$newC = $c[0..1046] + $c[1242..($c.Count-1)]
$newC | Set-Content 'c:\Users\User\OneDrive\Desktop\ARQOVEX\src\app\admin\page.tsx'
