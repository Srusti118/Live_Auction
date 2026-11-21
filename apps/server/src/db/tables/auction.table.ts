import { BaseTable } from '../baseTable'

export class AuctionTable extends BaseTable {
  readonly table = 'auctions'
  columns = this.setColumns((t) => ({
    id: t.uuid().primaryKey().default(t.sql`gen_random_uuid()`),
    title: t.varchar(255),
    description: t.text(),
    imageUrl: t.varchar(1024).nullable(),
    startingPrice: t.numeric(12, 2),
    reservePrice: t.numeric(12, 2),
    minIncrement: t.numeric(12, 2),
    currentPrice: t.numeric(12, 2),
    status: t.varchar(50).default('DRAFT'),
    startTime: t.timestamp(),
    endTime: t.timestamp(),
    originalEndTime: t.timestamp(),
    extensionsCount: t.integer().default(0),
    sellerId: t.uuid().foreignKey('users', 'id'),
    winnerId: t.uuid().foreignKey('users', 'id').nullable(),
    createdAt: t.timestamp().default(t.sql`NOW()`),
    updatedAt: t.timestamp().default(t.sql`NOW()`),
  }))
}
