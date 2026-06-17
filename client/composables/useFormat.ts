/**
 * 格式化工具 composable
 * 处理后端返回的 DECIMAL 字段（MySQL 驱动将 DECIMAL 返回为字符串）
 */

/** 格式化价格：后端 DECIMAL 字段返回字符串，需要转为数字再格式化 */
export function fmtPrice(price: number | string | null | undefined): string {
  if (price === null || price === undefined) return '0.00'
  return Number(price).toFixed(2)
}
