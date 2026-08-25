export class MockEngine {
  static STORAGE_KEY = 'forgeql_mock_storage';

  static getStorage() {
    const data = localStorage.getItem(this.STORAGE_KEY);
    return data ? JSON.parse(data) : {};
  }

  static saveStorage(data) {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
  }

  static execute(queryText) {
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
        } catch (e) {
          reject(new Error("Invalid JSON Query: " + e.message));
        }
      }, 300);
    });
  }
}
