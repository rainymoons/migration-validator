export type DatasetType = "member" | "order";

export type Severity = "error" | "warning";

export interface ValidationIssue {
  datasetType: DatasetType;
  rowNumber: number;
  columnIndex: number;
  columnName: string;
  code: string;
  severity: Severity;
  message: string;
  rawValue: string;
  normalizedValue?: string;
}

export interface ValidationRunOptions {
  type: DatasetType;
  inputPath: string;
  outDir: string;
  encoding: string;
  delimiter: string;
  strictEmailDomain: boolean;
}

export interface ValidationSummary {
  datasetType: DatasetType;
  totalRows: number;
  validRows: number;
  errorRows: number;
  warningRows: number;
  errorCount: number;
  warningCount: number;
  headerIssues: number;
  ruleCounts: Record<string, number>;
  generatedAt: string;
  inputPath: string;
}

export interface UnrecognizedHeader {
  header: string;
  columnIndex: number;
}

export interface ColumnResolution {
  actualHeaders: string[];
  fieldToIndex: Map<string, number>;
  fieldToActualHeader: Map<string, string>;
  duplicateFieldNames: string[];
  unrecognizedHeaders: UnrecognizedHeader[];
}

export interface SharedRuntime {
  options: ValidationRunOptions;
  emailDomainCache: Map<string, Promise<boolean>>;
}

export interface RowContext<State = unknown> {
  readonly datasetType: DatasetType;
  readonly rowNumber: number;
  readonly state: State;
  readonly runtime: SharedRuntime;
  readonly columns: ColumnResolution;
  readonly rowValues: string[];
  hasHeader: (fieldName: string) => boolean;
  getValue: (fieldName: string) => string;
  addIssue: (issue: Omit<ValidationIssue, "datasetType" | "rowNumber">) => void;
  addFieldIssue: (
    fieldName: string,
    issue: Omit<ValidationIssue, "datasetType" | "rowNumber" | "columnIndex" | "columnName">,
  ) => void;
}

export type FieldValidator = (value: string, ctx: RowContext<any>, field: FieldDefinition) => void | Promise<void>;
export type RowValidator = (ctx: RowContext<any>) => void | Promise<void>;

export interface FieldDefinition {
  name: string;
  aliases?: string[];
  requiredHeader?: boolean;
  required?: boolean | ((ctx: RowContext<any>) => boolean);
  validators?: Array<FieldValidator>;
}

export interface DatasetPreset<State = unknown> {
  type: DatasetType;
  displayName: string;
  fields: Array<FieldDefinition>;
  createState: () => State;
  rowValidators?: Array<RowValidator>;
}
