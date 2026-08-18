package com.forgeql.core.schema;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.*;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;

/**
 * Manages table schema definitions, foreign key constraints, and schema disk persistence.
 */
public class SchemaManager {
    private static final Logger log = LoggerFactory.getLogger(SchemaManager.class);
    private final Path storageDir;
    
    // Map of child table -> list of FK constraints where table is child
    private final ConcurrentHashMap<String, List<ForeignKeyConstraint>> childConstraints = new ConcurrentHashMap<>();
    
    // Map of parent table -> list of FK constraints where table is parent
    private final ConcurrentHashMap<String, List<ForeignKeyConstraint>> parentConstraints = new ConcurrentHashMap<>();

    public SchemaManager(Path storageDir) {
        this.storageDir = storageDir;
        loadAllSchemas();
    }

    public synchronized void addForeignKey(ForeignKeyConstraint fk) {
        childConstraints.computeIfAbsent(fk.getChildTable(), k -> new CopyOnWriteArrayList<>()).add(fk);
        parentConstraints.computeIfAbsent(fk.getParentTable(), k -> new CopyOnWriteArrayList<>()).add(fk);
        
        saveSchema(fk.getChildTable());
        log.info("Registered Foreign Key constraint: {}", fk);
    }

    public List<ForeignKeyConstraint> getChildConstraints(String childTable) {
        return childConstraints.getOrDefault(childTable, Collections.emptyList());
    }

    public List<ForeignKeyConstraint> getParentConstraints(String parentTable) {
        return parentConstraints.getOrDefault(parentTable, Collections.emptyList());
    }

    private void saveSchema(String tableName) {
        try {
            Path schemaPath = storageDir.resolve(tableName + ".schema");
            List<ForeignKeyConstraint> fks = getChildConstraints(tableName);
            
            try (ObjectOutputStream oos = new ObjectOutputStream(Files.newOutputStream(schemaPath))) {
                oos.writeObject(new ArrayList<>(fks));
            }
            log.info("Saved schema for table '{}' to {}", tableName, schemaPath);
        } catch (IOException e) {
            log.error("Failed to save schema for table '{}'", tableName, e);
        }
    }

    @SuppressWarnings("unchecked")
    private void loadAllSchemas() {
        if (!Files.exists(storageDir)) return;
        
        try {
            Files.list(storageDir)
                .filter(path -> path.toString().endsWith(".schema"))
                .forEach(schemaPath -> {
                    String fileName = schemaPath.getFileName().toString();
                    String tableName = fileName.substring(0, fileName.length() - ".schema".length());
                    try (ObjectInputStream ois = new ObjectInputStream(Files.newInputStream(schemaPath))) {
                        List<ForeignKeyConstraint> fks = (List<ForeignKeyConstraint>) ois.readObject();
                        for (ForeignKeyConstraint fk : fks) {
                            childConstraints.computeIfAbsent(fk.getChildTable(), k -> new CopyOnWriteArrayList<>()).add(fk);
                            parentConstraints.computeIfAbsent(fk.getParentTable(), k -> new CopyOnWriteArrayList<>()).add(fk);
                        }
                        log.info("Loaded {} Foreign Key constraints for table '{}'", fks.size(), tableName);
                    } catch (Exception e) {
                        log.error("Failed to load schema file {}", schemaPath, e);
                    }
                });
        } catch (IOException e) {
            log.error("Failed to scan storage directory for schema files", e);
        }
    }
}
