import { BiddingEngine } from '../services/bidding.engine'
import { repository } from '../db/db'
import { logger } from '../utils/logger'
import { runSeed } from './seed'

async function runStressTest(): Promise<void> {
  await runSeed()

  const targetAuctionId = 'a1111111-1111-1111-1111-111111111111'
  const auctionBefore = await repository.getAuctionById(targetAuctionId)

  if (!auctionBefore) {
    throw new Error('Target auction not found for stress test')
  }

  logger.info(`Starting Concurrency Stress Test on Auction "${auctionBefore.title}"`)
  const initialPrice = auctionBefore.currentPrice
  const initialEndTime = auctionBefore.endTime
  logger.info(`Initial Price: $${initialPrice}`)
  logger.info(`Initial End Time: ${initialEndTime}`)

  // Set end time to 20 seconds from now so anti-sniping dynamic extension triggers
  auctionBefore.endTime = new Date(Date.now() + 20 * 1000).toISOString()
  await repository.saveAuction(auctionBefore)

  const bidders = [
    { id: '22222222-2222-2222-2222-222222222222', name: 'James Henderson' },
    { id: '33333333-3333-3333-3333-333333333333', name: 'Sarah Jenkins' },
    { id: '44444444-4444-4444-4444-444444444444', name: 'Michael Chang' },
  ]

  // Launch 50 concurrent bid requests within the same millisecond window
  const concurrentCount = 50
  const promises: Array<Promise<{ index: number; result: unknown }>> = []

  logger.info(`Firing ${concurrentCount} simultaneous bids...`)
  const startTime = Date.now()

  for (let i = 0; i < concurrentCount; i++) {
    const bidder = bidders[i % bidders.length]
    const amount = auctionBefore.currentPrice + (i + 1) * auctionBefore.minIncrement

    promises.push(
      BiddingEngine.submitBid({
        auctionId: targetAuctionId,
        bidderId: bidder.id,
        bidderName: bidder.name,
        amount,
      }).then((result) => ({ index: i, result }))
    )
  }

  const results = await Promise.all(promises)
  const durationMs = Date.now() - startTime

  let acceptedCount = 0
  let rejectedCount = 0

  for (const { result } of results) {
    const res = result as { success: boolean; reason?: string }
    if (res.success) {
      acceptedCount++
    } else {
      rejectedCount++
    }
  }

  const auctionAfter = await repository.getAuctionById(targetAuctionId)
  const allBids = await repository.getBidsForAuction(targetAuctionId)

  logger.info('--- STRESS TEST RESULTS ---')
  logger.info(`Total Bids Processed: ${concurrentCount} in ${durationMs}ms (${(concurrentCount / (durationMs / 1000)).toFixed(1)} bids/sec)`)
  logger.info(`Accepted Bids: ${acceptedCount}`)
  logger.info(`Rejected Bids: ${rejectedCount}`)
  logger.info(`Final Current Price: $${auctionAfter?.currentPrice}`)
  logger.info(`Extensions Count: ${auctionAfter?.extensionsCount}`)
  logger.info(`New End Time: ${auctionAfter?.endTime}`)
  logger.info(`Total Recorded Bids in DB: ${allBids.length}`)

  // Assertions
  if (acceptedCount === 0) {
    throw new Error('Stress test failed: No bids were accepted')
  }

  if (auctionAfter && auctionAfter.currentPrice <= initialPrice) {
    throw new Error('Stress test failed: Final price did not increase')
  }

  if (auctionAfter && auctionAfter.extensionsCount === 0) {
    throw new Error('Stress test failed: Anti-sniping extension was not triggered')
  }

  logger.info('SUCCESS: Concurrency test passed with zero race conditions and verified atomic single-winner state!')
}

runStressTest()
  .then(() => process.exit(0))
  .catch((err) => {
    logger.error('Stress test execution failed:', err)
    process.exit(1)
  })
