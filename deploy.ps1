# 部署脚本
# 使用方法：在终端中运行 .\deploy.ps1

Write-Host "📕 小红书爆款笔记生成器 - 部署脚本" -ForegroundColor Red
Write-Host "========================================" -ForegroundColor Gray

# 检查是否登录
$login = vercel whoami 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️  尚未登录 Vercel，正在打开登录页面..." -ForegroundColor Yellow
    Start-Process "https://vercel.com/login"
    Write-Host ""
    Write-Host "请按以下步骤操作："
    Write-Host "  1. 在浏览器中完成 Vercel 登录（推荐用 GitHub 账号）"
    Write-Host "  2. 回到终端，重新运行此脚本"
    Write-Host ""
    exit 1
}

Write-Host "✅ 已登录 Vercel" -ForegroundColor Green
Write-Host ""
Write-Host "开始部署到 Vercel..." -ForegroundColor Cyan

# 部署（生产环境）
vercel --prod --yes

Write-Host ""
Write-Host "========================================" -ForegroundColor Gray
Write-Host "🎉 部署完成！" -ForegroundColor Green
Write-Host "你的产品链接会在上面显示，复制到浏览器即可访问"
