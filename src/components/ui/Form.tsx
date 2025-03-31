'use client';

import type React from 'react';

import { useState, useEffect } from 'react';
import {
  TextField,
  Select,
  MenuItem,
  FormControl,
  FormControlLabel,
  FormLabel,
  RadioGroup,
  Radio,
  Checkbox,
  InputLabel,
  FormGroup,
  FormHelperText,
  Button,
  Box,
  Typography,
  Paper,
} from '@mui/material';
import { FieldType, type FormField, type FormValues } from '../../types/form';

interface FormProps {
  fields: FormField[];
  title?: string;
  description?: string;
  onSubmit: (values: FormValues) => void;
  initialValues?: FormValues;
  submitButtonText?: string;
  cancelButtonText?: string;
  onCancel?: () => void;
}

const Form = ({
  fields,
  title,
  description,
  onSubmit,
  initialValues = {},
  submitButtonText = '제출',
  cancelButtonText = '취소',
  onCancel,
}: FormProps) => {
  const [values, setValues] = useState<FormValues>(initialValues);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    // Initialize form values from fields
    const defaultValues: FormValues = {};
    fields.forEach((field) => {
      if (!(field.id in initialValues)) {
        switch (field.type) {
          case FieldType.TEXT:
          case FieldType.TEXTAREA:
          case FieldType.EMAIL:
          case FieldType.TEL:
            defaultValues[field.id] = '';
            break;
          case FieldType.SELECT:
            defaultValues[field.id] = field.options?.[0]?.value || '';
            break;
          case FieldType.RADIO:
            defaultValues[field.id] = field.options?.[0]?.value || '';
            break;
          case FieldType.CHECKBOX:
            defaultValues[field.id] = false;
            break;
          case FieldType.CHECKBOX_GROUP:
            defaultValues[field.id] = [];
            break;
        }
      }
    });

    setValues({ ...defaultValues, ...initialValues });
  }, [fields, initialValues]);

  const handleChange = (fieldId: string, value: any) => {
    setValues((prev) => ({
      ...prev,
      [fieldId]: value,
    }));

    // Clear error when field is changed
    if (errors[fieldId]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[fieldId];
        return newErrors;
      });
    }
  };

  const handleCheckboxChange = (fieldId: string, checked: boolean) => {
    setValues((prev) => ({
      ...prev,
      [fieldId]: checked,
    }));
  };

  const handleCheckboxGroupChange = (fieldId: string, value: string, checked: boolean) => {
    setValues((prev) => {
      const currentValues = Array.isArray(prev[fieldId]) ? (prev[fieldId] as string[]) : [];
      let newValues: string[];

      if (checked) {
        newValues = [...currentValues, value];
      } else {
        newValues = currentValues.filter((v) => v !== value);
      }

      return {
        ...prev,
        [fieldId]: newValues,
      };
    });
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    fields.forEach((field) => {
      if (field.required) {
        const value = values[field.id];

        if (value === undefined || value === null || value === '') {
          newErrors[field.id] = '필수 입력 항목입니다.';
        } else if (
          field.type === FieldType.CHECKBOX_GROUP &&
          Array.isArray(value) &&
          value.length === 0
        ) {
          newErrors[field.id] = '하나 이상 선택해주세요.';
        }
      }

      if (
        field.type === FieldType.EMAIL &&
        values[field.id] &&
        !/\S+@\S+\.\S+/.test(values[field.id] as string)
      ) {
        newErrors[field.id] = '유효한 이메일 주소를 입력해주세요.';
      }

      if (
        field.type === FieldType.TEL &&
        values[field.id] &&
        !/^\d{2,3}-\d{3,4}-\d{4}$/.test(values[field.id] as string)
      ) {
        newErrors[field.id] = '유효한 전화번호 형식을 입력해주세요. (예: 010-1234-5678)';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validate()) {
      onSubmit(values);
    }
  };

  const renderField = (field: FormField) => {
    const { id, label, type, required, placeholder, options, helperText } = field;

    switch (type) {
      case FieldType.TEXT:
      case FieldType.EMAIL:
      case FieldType.TEL:
        return (
          <TextField
            id={id}
            label={label}
            type={type === FieldType.EMAIL ? 'email' : type === FieldType.TEL ? 'tel' : 'text'}
            value={values[id] || ''}
            onChange={(e) => handleChange(id, e.target.value)}
            required={required}
            placeholder={placeholder}
            fullWidth
            margin="normal"
            error={!!errors[id]}
            helperText={errors[id] || helperText}
          />
        );

      case FieldType.TEXTAREA:
        return (
          <TextField
            id={id}
            label={label}
            value={values[id] || ''}
            onChange={(e) => handleChange(id, e.target.value)}
            required={required}
            placeholder={placeholder}
            fullWidth
            margin="normal"
            multiline
            rows={4}
            error={!!errors[id]}
            helperText={errors[id] || helperText}
          />
        );

      case FieldType.SELECT:
        return (
          <FormControl fullWidth margin="normal" required={required} error={!!errors[id]}>
            <InputLabel id={`${id}-label`}>{label}</InputLabel>
            <Select
              labelId={`${id}-label`}
              id={id}
              value={values[id] || ''}
              onChange={(e) => handleChange(id, e.target.value)}
              label={label}
            >
              {options?.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
            {(errors[id] || helperText) && (
              <FormHelperText>{errors[id] || helperText}</FormHelperText>
            )}
          </FormControl>
        );

      case FieldType.RADIO:
        return (
          <FormControl
            component="fieldset"
            margin="normal"
            required={required}
            error={!!errors[id]}
          >
            <FormLabel component="legend">{label}</FormLabel>
            <RadioGroup
              name={id}
              value={values[id] || ''}
              onChange={(e) => handleChange(id, e.target.value)}
            >
              {options?.map((option) => (
                <FormControlLabel
                  key={option.value}
                  value={option.value}
                  control={<Radio />}
                  label={option.label}
                />
              ))}
            </RadioGroup>
            {(errors[id] || helperText) && (
              <FormHelperText>{errors[id] || helperText}</FormHelperText>
            )}
          </FormControl>
        );

      case FieldType.CHECKBOX:
        return (
          <FormControl
            component="fieldset"
            margin="normal"
            required={required}
            error={!!errors[id]}
          >
            <FormControlLabel
              control={
                <Checkbox
                  checked={!!values[id]}
                  onChange={(e) => handleCheckboxChange(id, e.target.checked)}
                />
              }
              label={label}
            />
            {(errors[id] || helperText) && (
              <FormHelperText>{errors[id] || helperText}</FormHelperText>
            )}
          </FormControl>
        );

      case FieldType.CHECKBOX_GROUP:
        return (
          <FormControl
            component="fieldset"
            margin="normal"
            required={required}
            error={!!errors[id]}
          >
            <FormLabel component="legend">{label}</FormLabel>
            <FormGroup>
              {options?.map((option) => (
                <FormControlLabel
                  key={option.value}
                  control={
                    <Checkbox
                      checked={
                        Array.isArray(values[id]) && (values[id] as string[]).includes(option.value)
                      }
                      onChange={(e) =>
                        handleCheckboxGroupChange(id, option.value, e.target.checked)
                      }
                    />
                  }
                  label={option.label}
                />
              ))}
            </FormGroup>
            {(errors[id] || helperText) && (
              <FormHelperText>{errors[id] || helperText}</FormHelperText>
            )}
          </FormControl>
        );

      default:
        return null;
    }
  };

  return (
    <Paper elevation={2} className="p-6">
      <form onSubmit={handleSubmit}>
        {title && (
          <Typography variant="h5" component="h2" gutterBottom>
            {title}
          </Typography>
        )}

        {description && (
          <Typography variant="body1" color="textSecondary" paragraph>
            {description}
          </Typography>
        )}

        {fields.map((field) => (
          <Box key={field.id}>{renderField(field)}</Box>
        ))}

        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
          {onCancel && (
            <Button variant="outlined" color="inherit" onClick={onCancel}>
              {cancelButtonText}
            </Button>
          )}
          <Button type="submit" variant="contained" color="primary">
            {submitButtonText}
          </Button>
        </Box>
      </form>
    </Paper>
  );
};

export default Form;
