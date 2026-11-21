import { BaseTable } from '../baseTable'

export class UserTable extends BaseTable {
  readonly table = 'users'
  columns = this.setColumns((t) => ({
    id: t.uuid().primaryKey().default(t.sql`gen_random_uuid()`),
    email: t.varchar(255).unique(),
    name: t.varchar(255),
    passwordHash: t.varchar(255),
    role: t.varchar(50).default('BIDDER'),
    balance: t.numeric(12, 2).default(10000.0),
    createdAt: t.timestamp().default(t.sql`NOW()`),
    updatedAt: t.timestamp().default(t.sql`NOW()`),
  }))
}
