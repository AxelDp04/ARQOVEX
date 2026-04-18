$body = @{
    messages = @(
        @{
            role = "user"
            content = "hola quien eres?"
        }
    )
} | ConvertTo-Json -Depth 5

$headers = @{
    "Content-Type" = "application/json"
}

try {
    $response = Invoke-RestMethod -Uri "https://arqovex.vercel.app/api/ai/chat" -Method Post -Headers $headers -Body $body
    Write-Host "✅ ARQO IA respondió correctamente:"
    Write-Host $response.content
} catch {
    Write-Host "❌ Error al llamar a ARQO IA:"
    Write-Host $_.Exception.Message
}
