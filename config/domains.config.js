// ============================================================================
// 域名锁配置 (Domain Lock)
// ----------------------------------------------------------------------------
// 规则：游戏仅允许在 localhost(本地开发) 与 pipygames.com(线上) 下正常运行。
// 其他域名加载完成后，等待 REDIRECT_DELAY_MS 毫秒，自动跳转至 REDIRECT_TO。
// 修改定义域白名单 / 跳转地址 / 延迟，只需改本文件。
// ============================================================================

export const DOMAIN_LOCK = {
  // 允许的域名（host 包含其一即通过）。localhost / 127.0.0.1 用于本地开发。
  allowedHosts: [
    'localhost',
    '127.0.0.1',
    'pipygames.com',
    'www.pipygames.com',
  ],
  // file:// 协议（直接双击 index.html）也允许，方便离线预览
  allowFileProtocol: true,
  // 非白名单域名跳转目标
  redirectTo: 'https://pipygames.com',
  // 加载完成后等待多少毫秒再跳转
  redirectDelayMs: 3000,
};

export default DOMAIN_LOCK;
