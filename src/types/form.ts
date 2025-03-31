export enum FieldType {
  TEXT = 'text',
  TEXTAREA = 'textarea',
  EMAIL = 'email',
  TEL = 'tel',
  SELECT = 'select',
  RADIO = 'radio',
  CHECKBOX = 'checkbox',
  CHECKBOX_GROUP = 'checkbox_group',
}

export interface FieldOption {
  label: string;
  value: string;
}

export interface FormField {
  id: string;
  type: FieldType;
  label: string;
  required?: boolean;
  placeholder?: string;
  helperText?: string;
  options?: FieldOption[];
}

export interface FormValues {
  [key: string]: string | boolean | string[];
}
