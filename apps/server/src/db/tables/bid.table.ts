import { BaseTable } from '../baseTable'

export class BidTable extends BaseTable {
  readonly table = 'bids'
  columns = this.setColumns((t) => ({
    id: t.uuid().primaryKey().default(t.sql`gen_random_uuid()`),
    auctionId: t.uuid().foreignKey('auctions', 'id'),
    bidderId: t.uuid().foreignKey('users', 'id'),
    bidderName: t.varchar(255),
    amount: t.numeric(12, 2),
    isAccepted: t.boolean().default(true),
    reason: t.varchar(255).nullable(),
    createdAt: t.timestamp().default(t.sql`NOW()`),
  }))
}
