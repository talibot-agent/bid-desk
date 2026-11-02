import { runMigrations } from "@agent-native/core/db";
import { BID_MIGRATIONS } from "../db/migrations.js";
export default runMigrations(BID_MIGRATIONS, { table: "bid_desk_migrations" });
