// ============================================================================
// 广告预设配置 (Ad Placements)
// ----------------------------------------------------------------------------
// 预先预留广告 SDK 配置位，支持后续快速接入广告账号。
// 配置项包含：广告位 ID、渠道开关、展示频率控制。
// 当前默认全部关闭（enabled:false），接入真实账号后打开开关并填入 placement id。
// ============================================================================

export const ADS = {
  // 总开关：false 时任何广告都不会展示
  enabled: false,

  // 广告渠道开关（接 SDK 时按渠道开启）
  channels: {
    admob: false,
    unity: false,
    ironsource: false,
    custom: false,
  },

  // 广告位定义
  placements: {
    // 横幅广告（持续展示）
    banner: {
      id: '',            // 广告位 ID
      enabled: false,
      refreshSec: 30,    // 刷新间隔
    },
    // 插屏广告（关卡完成时触发）
    interstitial: {
      id: '',            // 广告位 ID
      enabled: false,
      minGapSec: 60,     // 两次插屏最小间隔
    },
    // 激励视频（可选，奖励相关）
    rewarded: {
      id: '',            // 广告位 ID
      enabled: false,
    },
  },

  // 展示频率控制
  frequency: {
    // 每通关 N 关展示一次插屏（1 = 每关都展示；0 = 关闭基于关数的展示）
    showInterstitialEveryLevels: 2,
    // 距离上次展示最小间隔（秒），防止过于频繁
    minGapSec: 30,
  },
};

export default ADS;
