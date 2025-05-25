import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { ResultAsync } from 'neverthrow';
import { Schema } from '@infra/database/schema';

/**
 * runs the `runner` inside a drizzle transaction.
 * if the runner returns Err, the transaction is rolled back, and the Err is bubbled out
 * as a `ResultAsync` – callers stay on the railway.
 */
export const runInTransactionWithResult = <T, E>(
  db: NodePgDatabase<Schema>,
  runner: (tx: NodePgDatabase<Schema>) => ResultAsync<T, E>,
): ResultAsync<T, E> => {
  return ResultAsync.fromPromise(
    db.transaction(async (tx) => {
      const res = await runner(tx); // ResultAsync<T,E>

      if (res.isErr()) {
        // error branch - throw the neverthrow error so the drizzle can roll back
        throw res.error;
      }

      // ok branch – return the plain value so drizzle can commit
      return res.value as T;
    }),
    // whatever bubbled up from rollback becomes the Err
    (e) => e as E,
  );
};
