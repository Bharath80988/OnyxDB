export class MockEngine {
  private static readonly STORAGE_KEY = 'onyxdb_mock_storage';

  private static getStorage(): Record<string, any[]> {
    const data = localStorage.getItem(this.STORAGE_KEY);
    return data ? JSON.parse(data) : {};
  }

  private static saveStorage(data: Record<string, any[]>) {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
  }

  public static execute(queryText: string): Promise<any> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        try {
          const query = JSON.parse(queryText);
          const { action, table, data, id } = query;

          if (!action || !table) {
            return reject(new Error("Query must contain 'action' and 'table'"));
          }

          const db = this.getStorage();
          if (!db[table]) {
            db[table] = [];
          }

          if (action.toLowerCase() === 'insert') {
            if (!data || !data.id) {
              return reject(new Error("Insert data must contain an 'id'"));
            }
            
            // Upsert logic for mock
            const existingIdx = db[table].findIndex(r => r.id === data.id);
            if (existingIdx >= 0) {
              db[table][existingIdx] = data;
            } else {
              db[table].push(data);
            }
            
            this.saveStorage(db);
            resolve({
              status: "success",
              message: `Mock Inserted 1 row into ${table}`
            });
          } else if (action.toLowerCase() === 'select') {
            if (id !== undefined) {
              const row = db[table].find(r => r.id === id);
              resolve({
                status: "success",
                rows: row ? [row] : []
              });
            } else {
              resolve({
                status: "success",
                rows: db[table]
              });
            }
          } else {
            reject(new Error(`Action '${action}' is not supported in MockEngine.`));
          }
        } catch (e: any) {
          reject(new Error("Invalid JSON Query: " + e.message));
        }
      }, 300); // Simulate network latency
    });
  }
}
