import { Trade } from '@uniswap/router-sdk'
import { Currency, CurrencyAmount, Fraction, Percent, TradeType } from '@uniswap/sdk-core'
import { Pair } from '@uniswap/v2-sdk'
import { FeeAmount } from '@uniswap/v3-sdk'
import JSBI from 'jsbi'

import {
  ALLOWED_PRICE_IMPACT_HIGH,
  ALLOWED_PRICE_IMPACT_LOW,
  ALLOWED_PRICE_IMPACT_MEDIUM,
  BLOCKED_PRICE_IMPACT_NON_EXPERT,
  ONE_HUNDRED_PERCENT,
  ZERO_PERCENT,
} from '../constants/misc'

const THIRTY_BIPS_FEE = new Percent(JSBI.BigInt(30), JSBI.BigInt(10000))
const INPUT_FRACTION_AFTER_FEE = ONE_HUNDRED_PERCENT.subtract(THIRTY_BIPS_FEE)

export function computeRealizedPriceImpact(trade: Trade<Currency, Currency, TradeType>): Percent {
  const realizedLpFeePercent = computeRealizedLPFeePercent(trade)
  return trade.priceImpact.subtract(realizedLpFeePercent)
}

// computes realized lp fee as a percent
//function computeRealizedLPFeePercent(trade: Trade<Currency, Currency, TradeType>): Percent {
function computeRealizedLPFeePercent(trade: any): Percent {
  return new Percent(0, 1)
}

// computes price breakdown for the trade
export function computeRealizedLPFeeAmount(
  trade?: Trade<Currency, Currency, TradeType> | null
): CurrencyAmount<Currency> | undefined {
  if (trade) {
    const realizedLPFee = computeRealizedLPFeePercent(trade)

    // the amount of the input that accrues to LPs
    return CurrencyAmount.fromRawAmount(trade.inputAmount.currency, trade.inputAmount.multiply(realizedLPFee).quotient)
  }

  return undefined
}

const IMPACT_TIERS = [
  BLOCKED_PRICE_IMPACT_NON_EXPERT,
  ALLOWED_PRICE_IMPACT_HIGH,
  ALLOWED_PRICE_IMPACT_MEDIUM,
  ALLOWED_PRICE_IMPACT_LOW,
]

type WarningSeverity = 0 | 1 | 2 | 3 | 4
export function warningSeverity(priceImpact: Percent | undefined): WarningSeverity {
  if (!priceImpact) return 4
  let impact: WarningSeverity = IMPACT_TIERS.length as WarningSeverity
  for (const impactLevel of IMPACT_TIERS) {
    if (impactLevel.lessThan(priceImpact)) return impact
    impact--
  }
  return 0
}
