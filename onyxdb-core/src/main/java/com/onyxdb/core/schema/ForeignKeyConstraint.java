package com.onyxdb.core.schema;

import java.io.Serializable;
import java.util.Objects;

/**
 * Represents a Foreign Key relational constraint between a child table field and a parent table field.
 */
public class ForeignKeyConstraint implements Serializable {
    private static final long serialVersionUID = 1L;

    public enum OnDeleteAction {
        RESTRICT,
        CASCADE
    }

    private final String childTable;
    private final String childField;
    private final String parentTable;
    private final String parentField;
    private final OnDeleteAction onDelete;

    public ForeignKeyConstraint(String childTable, String childField, String parentTable, String parentField, OnDeleteAction onDelete) {
        if (childTable == null || childField == null || parentTable == null || parentField == null) {
            throw new IllegalArgumentException("Foreign key fields and tables cannot be null.");
        }
        this.childTable = childTable;
        this.childField = childField;
        this.parentTable = parentTable;
        this.parentField = parentField;
        this.onDelete = onDelete != null ? onDelete : OnDeleteAction.RESTRICT;
    }

    public String getChildTable() {
        return childTable;
    }

    public String getChildField() {
        return childField;
    }

    public String getParentTable() {
        return parentTable;
    }

    public String getParentField() {
        return parentField;
    }

    public OnDeleteAction getOnDelete() {
        return onDelete;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        ForeignKeyConstraint that = (ForeignKeyConstraint) o;
        return Objects.equals(childTable, that.childTable) &&
                Objects.equals(childField, that.childField) &&
                Objects.equals(parentTable, that.parentTable) &&
                Objects.equals(parentField, that.parentField) &&
                onDelete == that.onDelete;
    }

    @Override
    public int hashCode() {
        return Objects.hash(childTable, childField, parentTable, parentField, onDelete);
    }

    @Override
    public String toString() {
        return "ForeignKeyConstraint{" +
                "childTable='" + childTable + '\'' +
                ", childField='" + childField + '\'' +
                ", parentTable='" + parentTable + '\'' +
                ", parentField='" + parentField + '\'' +
                ", onDelete=" + onDelete +
                '}';
    }
}
