/**
 * This code was generated by a tool.
 * ility@{{version}}
 *
 * Changes to this file may cause incorrect behavior and will be lost if
 * the code is regenerated.
 */

import * as types from './types';

export type ValidationError = { code: string; title: string; path: string };

/**
 * Validates input parameters for the getGizmos() method.
 */
export function validateGetGizmosParams(params?: {
  search?: string;
}): ValidationError[] {
  const errors: ValidationError[] = [];
  if (!params) return [];
  if (
    typeof params.search !== 'undefined' &&
    typeof params.search !== 'string'
  ) {
    errors.push({
      code: 'TYPE',
      title: '"search" must be a string if supplied',
      path: 'search',
    });
  }
  return errors;
}

/**
 * Validates input parameters for the createGizmo() method.
 */
export function validateCreateGizmoParams(params?: {
  /**
   * Anonymous enum
   */
  size?: types.CreateGizmoSize;
}): ValidationError[] {
  const errors: ValidationError[] = [];
  if (!params) return [];
  if (typeof params.size !== 'undefined') {
    errors.push(...validateCreateGizmoSize(params.size));
  }
  if (
    typeof params.size === 'string' &&
    !['small', 'medium', 'big', 'XL'].includes(params.size)
  ) {
    errors.push({
      code: 'STRING_ENUM',
      title: '"size" must be one of ["small", "medium", "big", "XL"]',
      path: 'size',
    });
  }
  return errors;
}

/**
 * Validates input parameters for the updateGizmo() method.
 */
export function validateUpdateGizmoParams(params?: {
  /**
   * array of primitive
   */
  factors?: string[];
}): ValidationError[] {
  const errors: ValidationError[] = [];
  if (!params) return [];
  if (
    Array.isArray(params.factors) &&
    params.factors.some((x) => typeof x !== 'string')
  ) {
    errors.push({
      code: 'TYPE',
      title: 'Each item in "factors" must be a string if supplied',
      path: 'factors',
    });
  }
  if (Array.isArray(params.factors) && params.factors.length > 6) {
    errors.push({
      code: 'ARRAY_MAX_ITEMS',
      title: '"factors" max length is 6',
      path: 'factors',
    });
  }
  if (Array.isArray(params.factors) && params.factors.length < 2) {
    errors.push({
      code: 'ARRAY_MIN_ITEMS',
      title: '"factors" min length is 2',
      path: 'factors',
    });
  }
  if (
    Array.isArray(params.factors) &&
    !params.factors.some((x) => typeof x === 'string' && /[0-9a-fA-F]+/.test(x))
  ) {
    errors.push({
      code: 'STRING_PATTERN',
      title: 'Each item in "factors" must match the pattern /[0-9a-fA-F]+/',
      path: 'factors',
    });
  }
  return errors;
}

/**
 * Validates input parameters for the getWidgets() method.
 */
export function validateGetWidgetsParams(): ValidationError[] {
  return [];
}

/**
 * Validates input parameters for the createWidget() method.
 */
export function validateCreateWidgetParams(params?: {
  /**
   * The new widget
   */
  body?: types.CreateWidgetBody;
}): ValidationError[] {
  const errors: ValidationError[] = [];
  if (!params) return [];
  if (typeof params.body !== 'undefined') {
    errors.push(...validateCreateWidgetBody(params.body));
  }
  return errors;
}

/**
 * Validates input parameters for the putWidget() method.
 */
export function validatePutWidgetParams(): ValidationError[] {
  return [];
}

/**
 * Validates input parameters for the getWidgetFoo() method.
 */
export function validateGetWidgetFooParams(params: {
  /**
   * The widget ID
   */
  id: string;
}): ValidationError[] {
  const errors: ValidationError[] = [];
  if (typeof params.id === 'undefined') {
    errors.push({ code: 'REQUIRED', title: '"id" is required', path: 'id' });
  }
  if (typeof params.id !== 'undefined' && typeof params.id !== 'string') {
    errors.push({ code: 'TYPE', title: '"id" must be a string', path: 'id' });
  }
  if (typeof params.id === 'string' && params.id.length > 30) {
    errors.push({
      code: 'STRING_MAX_LENGTH',
      title: '"id" max length is 30',
      path: 'id',
    });
  }
  return errors;
}

/**
 * Validates input parameters for the deleteWidgetFoo() method.
 */
export function validateDeleteWidgetFooParams(params: {
  /**
   * The widget ID
   */
  id: string;
}): ValidationError[] {
  const errors: ValidationError[] = [];
  if (typeof params.id === 'undefined') {
    errors.push({ code: 'REQUIRED', title: '"id" is required', path: 'id' });
  }
  if (typeof params.id !== 'undefined' && typeof params.id !== 'string') {
    errors.push({ code: 'TYPE', title: '"id" must be a string', path: 'id' });
  }
  if (typeof params.id === 'string' && params.id.length > 30) {
    errors.push({
      code: 'STRING_MAX_LENGTH',
      title: '"id" max length is 30',
      path: 'id',
    });
  }
  return errors;
}

/**
 * Validates input parameters for the exhaustiveParams() method.
 */
export function validateExhaustiveParamsParams(params: {
  pathString: string;
  pathEnum: types.ExhaustiveParamsPathEnum;
  pathNumber: number;
  pathInteger: number;
  pathBoolean: boolean;
  pathStringArray: string[];
  pathEnumArray: types.ExhaustiveParamsPathEnumArray[];
  pathNumberArray: number[];
  pathIntegerArray: number[];
  pathBooleanArray: boolean[];
  queryString?: string;
  queryEnum?: types.ExhaustiveParamsQueryEnum;
  queryNumber?: number;
  queryInteger?: number;
  queryBoolean?: boolean;
  queryStringArray?: string[];
  queryEnumArray?: types.ExhaustiveParamsQueryEnumArray[];
  queryNumberArray?: number[];
  queryIntegerArray?: number[];
  queryBooleanArray?: boolean[];
  headerString?: string;
  headerEnum?: types.ExhaustiveParamsHeaderEnum;
  headerNumber?: number;
  headerInteger?: number;
  headerBoolean?: boolean;
  headerStringArray?: string[];
  headerEnumArray?: types.ExhaustiveParamsHeaderEnumArray[];
  headerNumberArray?: number[];
  headerIntegerArray?: number[];
  headerBooleanArray?: boolean[];
  body?: types.ExhaustiveParamsBody;
}): ValidationError[] {
  const errors: ValidationError[] = [];
  if (
    typeof params.queryString !== 'undefined' &&
    typeof params.queryString !== 'string'
  ) {
    errors.push({
      code: 'TYPE',
      title: '"queryString" must be a string if supplied',
      path: 'queryString',
    });
  }
  if (typeof params.queryEnum !== 'undefined') {
    errors.push(...validateExhaustiveParamsQueryEnum(params.queryEnum));
  }
  if (
    typeof params.queryEnum === 'string' &&
    !['one', 'two', 'three'].includes(params.queryEnum)
  ) {
    errors.push({
      code: 'STRING_ENUM',
      title: '"queryEnum" must be one of ["one", "two", "three"]',
      path: 'queryEnum',
    });
  }
  if (
    typeof params.queryNumber !== 'undefined' &&
    typeof params.queryNumber !== 'number'
  ) {
    errors.push({
      code: 'TYPE',
      title: '"queryNumber" must be a number if supplied',
      path: 'queryNumber',
    });
  }
  if (
    typeof params.queryInteger !== 'undefined' &&
    typeof params.queryInteger !== 'number'
  ) {
    errors.push({
      code: 'TYPE',
      title: '"queryInteger" must be a number if supplied',
      path: 'queryInteger',
    });
  }
  if (
    typeof params.queryBoolean !== 'undefined' &&
    typeof params.queryBoolean !== 'boolean'
  ) {
    errors.push({
      code: 'TYPE',
      title: '"queryBoolean" must be a boolean if supplied',
      path: 'queryBoolean',
    });
  }
  if (
    Array.isArray(params.queryStringArray) &&
    params.queryStringArray.some((x) => typeof x !== 'string')
  ) {
    errors.push({
      code: 'TYPE',
      title: 'Each item in "queryStringArray" must be a string if supplied',
      path: 'queryStringArray',
    });
  }
  if (typeof params.queryEnumArray !== 'undefined') {
    params.queryEnumArray.forEach((arrayItem) =>
      errors.push(...validateExhaustiveParamsQueryEnumArray(arrayItem)),
    );
  }
  if (
    Array.isArray(params.queryEnumArray) &&
    !params.queryEnumArray.some(
      (x) => typeof x === 'string' && !['one', 'two', 'three'].includes(x),
    )
  ) {
    errors.push({
      code: 'STRING_ENUM',
      title:
        'Each item in "queryEnumArray" must be one of ["one", "two", "three"]',
      path: 'queryEnumArray',
    });
  }
  if (
    Array.isArray(params.queryNumberArray) &&
    params.queryNumberArray.some((x) => typeof x !== 'number')
  ) {
    errors.push({
      code: 'TYPE',
      title: 'Each item in "queryNumberArray" must be a number if supplied',
      path: 'queryNumberArray',
    });
  }
  if (
    Array.isArray(params.queryIntegerArray) &&
    params.queryIntegerArray.some((x) => typeof x !== 'number')
  ) {
    errors.push({
      code: 'TYPE',
      title: 'Each item in "queryIntegerArray" must be a number if supplied',
      path: 'queryIntegerArray',
    });
  }
  if (
    Array.isArray(params.queryBooleanArray) &&
    params.queryBooleanArray.some((x) => typeof x !== 'boolean')
  ) {
    errors.push({
      code: 'TYPE',
      title: 'Each item in "queryBooleanArray" must be a boolean if supplied',
      path: 'queryBooleanArray',
    });
  }
  if (typeof params.pathString === 'undefined') {
    errors.push({
      code: 'REQUIRED',
      title: '"pathString" is required',
      path: 'pathString',
    });
  }
  if (
    typeof params.pathString !== 'undefined' &&
    typeof params.pathString !== 'string'
  ) {
    errors.push({
      code: 'TYPE',
      title: '"pathString" must be a string',
      path: 'pathString',
    });
  }
  if (typeof params.pathEnum === 'undefined') {
    errors.push({
      code: 'REQUIRED',
      title: '"pathEnum" is required',
      path: 'pathEnum',
    });
  }
  if (typeof params.pathEnum !== 'undefined') {
    errors.push(...validateExhaustiveParamsPathEnum(params.pathEnum));
  }
  if (
    typeof params.pathEnum === 'string' &&
    !['one', 'two', 'three'].includes(params.pathEnum)
  ) {
    errors.push({
      code: 'STRING_ENUM',
      title: '"pathEnum" must be one of ["one", "two", "three"]',
      path: 'pathEnum',
    });
  }
  if (typeof params.pathNumber === 'undefined') {
    errors.push({
      code: 'REQUIRED',
      title: '"pathNumber" is required',
      path: 'pathNumber',
    });
  }
  if (
    typeof params.pathNumber !== 'undefined' &&
    typeof params.pathNumber !== 'number'
  ) {
    errors.push({
      code: 'TYPE',
      title: '"pathNumber" must be a number',
      path: 'pathNumber',
    });
  }
  if (typeof params.pathInteger === 'undefined') {
    errors.push({
      code: 'REQUIRED',
      title: '"pathInteger" is required',
      path: 'pathInteger',
    });
  }
  if (
    typeof params.pathInteger !== 'undefined' &&
    typeof params.pathInteger !== 'number'
  ) {
    errors.push({
      code: 'TYPE',
      title: '"pathInteger" must be a number',
      path: 'pathInteger',
    });
  }
  if (typeof params.pathBoolean === 'undefined') {
    errors.push({
      code: 'REQUIRED',
      title: '"pathBoolean" is required',
      path: 'pathBoolean',
    });
  }
  if (
    typeof params.pathBoolean !== 'undefined' &&
    typeof params.pathBoolean !== 'boolean'
  ) {
    errors.push({
      code: 'TYPE',
      title: '"pathBoolean" must be a boolean',
      path: 'pathBoolean',
    });
  }
  if (typeof params.pathStringArray === 'undefined') {
    errors.push({
      code: 'REQUIRED',
      title: '"pathStringArray" is required',
      path: 'pathStringArray',
    });
  }
  if (
    Array.isArray(params.pathStringArray) &&
    params.pathStringArray.some((x) => typeof x !== 'string')
  ) {
    errors.push({
      code: 'TYPE',
      title: 'Each item in "pathStringArray" must be a string',
      path: 'pathStringArray',
    });
  }
  if (typeof params.pathEnumArray === 'undefined') {
    errors.push({
      code: 'REQUIRED',
      title: '"pathEnumArray" is required',
      path: 'pathEnumArray',
    });
  }
  if (typeof params.pathEnumArray !== 'undefined') {
    params.pathEnumArray.forEach((arrayItem) =>
      errors.push(...validateExhaustiveParamsPathEnumArray(arrayItem)),
    );
  }
  if (
    Array.isArray(params.pathEnumArray) &&
    !params.pathEnumArray.some(
      (x) => typeof x === 'string' && !['one', 'two', 'three'].includes(x),
    )
  ) {
    errors.push({
      code: 'STRING_ENUM',
      title:
        'Each item in "pathEnumArray" must be one of ["one", "two", "three"]',
      path: 'pathEnumArray',
    });
  }
  if (typeof params.pathNumberArray === 'undefined') {
    errors.push({
      code: 'REQUIRED',
      title: '"pathNumberArray" is required',
      path: 'pathNumberArray',
    });
  }
  if (
    Array.isArray(params.pathNumberArray) &&
    params.pathNumberArray.some((x) => typeof x !== 'number')
  ) {
    errors.push({
      code: 'TYPE',
      title: 'Each item in "pathNumberArray" must be a number',
      path: 'pathNumberArray',
    });
  }
  if (typeof params.pathIntegerArray === 'undefined') {
    errors.push({
      code: 'REQUIRED',
      title: '"pathIntegerArray" is required',
      path: 'pathIntegerArray',
    });
  }
  if (
    Array.isArray(params.pathIntegerArray) &&
    params.pathIntegerArray.some((x) => typeof x !== 'number')
  ) {
    errors.push({
      code: 'TYPE',
      title: 'Each item in "pathIntegerArray" must be a number',
      path: 'pathIntegerArray',
    });
  }
  if (typeof params.pathBooleanArray === 'undefined') {
    errors.push({
      code: 'REQUIRED',
      title: '"pathBooleanArray" is required',
      path: 'pathBooleanArray',
    });
  }
  if (
    Array.isArray(params.pathBooleanArray) &&
    params.pathBooleanArray.some((x) => typeof x !== 'boolean')
  ) {
    errors.push({
      code: 'TYPE',
      title: 'Each item in "pathBooleanArray" must be a boolean',
      path: 'pathBooleanArray',
    });
  }
  if (
    typeof params.headerString !== 'undefined' &&
    typeof params.headerString !== 'string'
  ) {
    errors.push({
      code: 'TYPE',
      title: '"headerString" must be a string if supplied',
      path: 'headerString',
    });
  }
  if (typeof params.headerEnum !== 'undefined') {
    errors.push(...validateExhaustiveParamsHeaderEnum(params.headerEnum));
  }
  if (
    typeof params.headerEnum === 'string' &&
    !['one', 'two', 'three'].includes(params.headerEnum)
  ) {
    errors.push({
      code: 'STRING_ENUM',
      title: '"headerEnum" must be one of ["one", "two", "three"]',
      path: 'headerEnum',
    });
  }
  if (
    typeof params.headerNumber !== 'undefined' &&
    typeof params.headerNumber !== 'number'
  ) {
    errors.push({
      code: 'TYPE',
      title: '"headerNumber" must be a number if supplied',
      path: 'headerNumber',
    });
  }
  if (
    typeof params.headerInteger !== 'undefined' &&
    typeof params.headerInteger !== 'number'
  ) {
    errors.push({
      code: 'TYPE',
      title: '"headerInteger" must be a number if supplied',
      path: 'headerInteger',
    });
  }
  if (
    typeof params.headerBoolean !== 'undefined' &&
    typeof params.headerBoolean !== 'boolean'
  ) {
    errors.push({
      code: 'TYPE',
      title: '"headerBoolean" must be a boolean if supplied',
      path: 'headerBoolean',
    });
  }
  if (
    Array.isArray(params.headerStringArray) &&
    params.headerStringArray.some((x) => typeof x !== 'string')
  ) {
    errors.push({
      code: 'TYPE',
      title: 'Each item in "headerStringArray" must be a string if supplied',
      path: 'headerStringArray',
    });
  }
  if (typeof params.headerEnumArray !== 'undefined') {
    params.headerEnumArray.forEach((arrayItem) =>
      errors.push(...validateExhaustiveParamsHeaderEnumArray(arrayItem)),
    );
  }
  if (
    Array.isArray(params.headerEnumArray) &&
    !params.headerEnumArray.some(
      (x) => typeof x === 'string' && !['one', 'two', 'three'].includes(x),
    )
  ) {
    errors.push({
      code: 'STRING_ENUM',
      title:
        'Each item in "headerEnumArray" must be one of ["one", "two", "three"]',
      path: 'headerEnumArray',
    });
  }
  if (
    Array.isArray(params.headerNumberArray) &&
    params.headerNumberArray.some((x) => typeof x !== 'number')
  ) {
    errors.push({
      code: 'TYPE',
      title: 'Each item in "headerNumberArray" must be a number if supplied',
      path: 'headerNumberArray',
    });
  }
  if (
    Array.isArray(params.headerIntegerArray) &&
    params.headerIntegerArray.some((x) => typeof x !== 'number')
  ) {
    errors.push({
      code: 'TYPE',
      title: 'Each item in "headerIntegerArray" must be a number if supplied',
      path: 'headerIntegerArray',
    });
  }
  if (
    Array.isArray(params.headerBooleanArray) &&
    params.headerBooleanArray.some((x) => typeof x !== 'boolean')
  ) {
    errors.push({
      code: 'TYPE',
      title: 'Each item in "headerBooleanArray" must be a boolean if supplied',
      path: 'headerBooleanArray',
    });
  }
  if (typeof params.body !== 'undefined') {
    errors.push(...validateExhaustiveParamsBody(params.body));
  }
  return errors;
}

export function validateGizmo(params: types.Gizmo): ValidationError[] {
  const errors: ValidationError[] = [];
  if (typeof params.id !== 'undefined' && typeof params.id !== 'string') {
    errors.push({
      code: 'TYPE',
      title: '"id" must be a string if supplied',
      path: 'id',
    });
  }
  if (typeof params.id === 'string' && params.id.length > 30) {
    errors.push({
      code: 'STRING_MAX_LENGTH',
      title: '"id" max length is 30',
      path: 'id',
    });
  }
  if (typeof params.name !== 'undefined' && typeof params.name !== 'string') {
    errors.push({
      code: 'TYPE',
      title: '"name" must be a string if supplied',
      path: 'name',
    });
  }
  if (typeof params.size !== 'undefined') {
    errors.push(...validateProductSize(params.size));
  }
  if (
    typeof params.size === 'string' &&
    !['small', 'medium', 'large'].includes(params.size)
  ) {
    errors.push({
      code: 'STRING_ENUM',
      title: '"size" must be one of ["small", "medium", "large"]',
      path: 'size',
    });
  }
  return errors;
}
export function isGizmo(obj: any): obj is types.Gizmo {
  return typeof obj !== 'undefined' && !validateGizmo(obj).length;
}

export function validateWidget(params: types.Widget): ValidationError[] {
  const errors: ValidationError[] = [];
  if (typeof params.id === 'undefined') {
    errors.push({ code: 'REQUIRED', title: '"id" is required', path: 'id' });
  }
  if (typeof params.id !== 'undefined' && typeof params.id !== 'string') {
    errors.push({ code: 'TYPE', title: '"id" must be a string', path: 'id' });
  }
  if (typeof params.id === 'string' && params.id.length > 30) {
    errors.push({
      code: 'STRING_MAX_LENGTH',
      title: '"id" max length is 30',
      path: 'id',
    });
  }
  if (typeof params.name !== 'undefined' && typeof params.name !== 'string') {
    errors.push({
      code: 'TYPE',
      title: '"name" must be a string if supplied',
      path: 'name',
    });
  }
  if (typeof params.name === 'string' && params.name.length > 30) {
    errors.push({
      code: 'STRING_MAX_LENGTH',
      title: '"name" max length is 30',
      path: 'name',
    });
  }
  if (typeof params.name === 'string' && /[0-9a-fA-F]+/.test(params.name)) {
    errors.push({
      code: 'STRING_PATTERN',
      title: '"name" must match the pattern /[0-9a-fA-F]+/',
      path: 'name',
    });
  }
  if (typeof params.fiz !== 'undefined' && typeof params.fiz !== 'number') {
    errors.push({
      code: 'TYPE',
      title: '"fiz" must be a number if supplied',
      path: 'fiz',
    });
  }
  if (typeof params.fiz === 'number' && params.fiz % 3 !== 0) {
    errors.push({
      code: 'NUMBER_MULTIPLE_OF',
      title: '"fiz" must be a multiple of 3',
      path: 'fiz',
    });
  }
  if (typeof params.buzz !== 'undefined' && typeof params.buzz !== 'number') {
    errors.push({
      code: 'TYPE',
      title: '"buzz" must be a number if supplied',
      path: 'buzz',
    });
  }
  if (typeof params.buzz === 'number' && params.buzz % 5 !== 0) {
    errors.push({
      code: 'NUMBER_MULTIPLE_OF',
      title: '"buzz" must be a multiple of 5',
      path: 'buzz',
    });
  }
  if (
    typeof params.fizbuzz !== 'undefined' &&
    typeof params.fizbuzz !== 'number'
  ) {
    errors.push({
      code: 'TYPE',
      title: '"fizbuzz" must be a number if supplied',
      path: 'fizbuzz',
    });
  }
  if (typeof params.fizbuzz === 'number' && params.fizbuzz % 15 !== 0) {
    errors.push({
      code: 'NUMBER_MULTIPLE_OF',
      title: '"fizbuzz" must be a multiple of 15',
      path: 'fizbuzz',
    });
  }
  if (typeof params.foo !== 'undefined') {
    errors.push(...validateWidgetFoo(params.foo));
  }
  if (typeof params.size !== 'undefined') {
    errors.push(...validateProductSize(params.size));
  }
  if (
    typeof params.size === 'string' &&
    !['small', 'medium', 'large'].includes(params.size)
  ) {
    errors.push({
      code: 'STRING_ENUM',
      title: '"size" must be one of ["small", "medium", "large"]',
      path: 'size',
    });
  }
  return errors;
}
export function isWidget(obj: any): obj is types.Widget {
  return typeof obj !== 'undefined' && !validateWidget(obj).length;
}

export function validateNewWidget(params: types.NewWidget): ValidationError[] {
  const errors: ValidationError[] = [];
  if (typeof params.name !== 'undefined' && typeof params.name !== 'string') {
    errors.push({
      code: 'TYPE',
      title: '"name" must be a string if supplied',
      path: 'name',
    });
  }
  if (typeof params.name === 'string' && params.name.length > 30) {
    errors.push({
      code: 'STRING_MAX_LENGTH',
      title: '"name" max length is 30',
      path: 'name',
    });
  }
  if (typeof params.name === 'string' && /[0-9a-fA-F]+/.test(params.name)) {
    errors.push({
      code: 'STRING_PATTERN',
      title: '"name" must match the pattern /[0-9a-fA-F]+/',
      path: 'name',
    });
  }
  if (typeof params.fiz !== 'undefined' && typeof params.fiz !== 'number') {
    errors.push({
      code: 'TYPE',
      title: '"fiz" must be a number if supplied',
      path: 'fiz',
    });
  }
  if (typeof params.fiz === 'number' && params.fiz % 3 !== 0) {
    errors.push({
      code: 'NUMBER_MULTIPLE_OF',
      title: '"fiz" must be a multiple of 3',
      path: 'fiz',
    });
  }
  if (typeof params.buzz !== 'undefined' && typeof params.buzz !== 'number') {
    errors.push({
      code: 'TYPE',
      title: '"buzz" must be a number if supplied',
      path: 'buzz',
    });
  }
  if (typeof params.buzz === 'number' && params.buzz % 5 !== 0) {
    errors.push({
      code: 'NUMBER_MULTIPLE_OF',
      title: '"buzz" must be a multiple of 5',
      path: 'buzz',
    });
  }
  if (
    typeof params.fizbuzz !== 'undefined' &&
    typeof params.fizbuzz !== 'number'
  ) {
    errors.push({
      code: 'TYPE',
      title: '"fizbuzz" must be a number if supplied',
      path: 'fizbuzz',
    });
  }
  if (typeof params.fizbuzz === 'number' && params.fizbuzz % 15 !== 0) {
    errors.push({
      code: 'NUMBER_MULTIPLE_OF',
      title: '"fizbuzz" must be a multiple of 15',
      path: 'fizbuzz',
    });
  }
  if (typeof params.foo !== 'undefined') {
    errors.push(...validateNewWidgetFoo(params.foo));
  }
  if (typeof params.size !== 'undefined') {
    errors.push(...validateProductSize(params.size));
  }
  if (
    typeof params.size === 'string' &&
    !['small', 'medium', 'large'].includes(params.size)
  ) {
    errors.push({
      code: 'STRING_ENUM',
      title: '"size" must be one of ["small", "medium", "large"]',
      path: 'size',
    });
  }
  return errors;
}
export function isNewWidget(obj: any): obj is types.NewWidget {
  return typeof obj !== 'undefined' && !validateNewWidget(obj).length;
}

export function validateGizmosResponse(
  params: types.GizmosResponse,
): ValidationError[] {
  const errors: ValidationError[] = [];
  if (typeof params.data === 'undefined') {
    errors.push({
      code: 'REQUIRED',
      title: '"data" is required',
      path: 'data',
    });
  }
  if (typeof params.data !== 'undefined') {
    params.data.forEach((arrayItem) =>
      errors.push(...validateGizmo(arrayItem)),
    );
  }
  return errors;
}
export function isGizmosResponse(obj: any): obj is types.GizmosResponse {
  return typeof obj !== 'undefined' && !validateGizmosResponse(obj).length;
}

export function validateCreateWidgetBody(
  params: types.CreateWidgetBody,
): ValidationError[] {
  const errors: ValidationError[] = [];
  if (typeof params.name === 'undefined') {
    errors.push({
      code: 'REQUIRED',
      title: '"name" is required',
      path: 'name',
    });
  }
  if (typeof params.name !== 'undefined' && typeof params.name !== 'string') {
    errors.push({
      code: 'TYPE',
      title: '"name" must be a string',
      path: 'name',
    });
  }
  return errors;
}
export function isCreateWidgetBody(obj: any): obj is types.CreateWidgetBody {
  return typeof obj !== 'undefined' && !validateCreateWidgetBody(obj).length;
}

export function validateExhaustiveParamsBody(
  params: types.ExhaustiveParamsBody,
): ValidationError[] {
  const errors: ValidationError[] = [];
  if (typeof params.foo !== 'undefined' && typeof params.foo !== 'string') {
    errors.push({
      code: 'TYPE',
      title: '"foo" must be a string if supplied',
      path: 'foo',
    });
  }
  if (typeof params.bar !== 'undefined' && typeof params.bar !== 'string') {
    errors.push({
      code: 'TYPE',
      title: '"bar" must be a string if supplied',
      path: 'bar',
    });
  }
  return errors;
}
export function isExhaustiveParamsBody(
  obj: any,
): obj is types.ExhaustiveParamsBody {
  return (
    typeof obj !== 'undefined' && !validateExhaustiveParamsBody(obj).length
  );
}

export function validateWidgetFoo(params: types.WidgetFoo): ValidationError[] {
  const errors: ValidationError[] = [];
  if (typeof params.fiz !== 'undefined' && typeof params.fiz !== 'number') {
    errors.push({
      code: 'TYPE',
      title: '"fiz" must be a number if supplied',
      path: 'fiz',
    });
  }
  if (typeof params.buzz === 'undefined') {
    errors.push({
      code: 'REQUIRED',
      title: '"buzz" is required',
      path: 'buzz',
    });
  }
  if (typeof params.buzz !== 'undefined' && typeof params.buzz !== 'number') {
    errors.push({
      code: 'TYPE',
      title: '"buzz" must be a number',
      path: 'buzz',
    });
  }
  return errors;
}
export function isWidgetFoo(obj: any): obj is types.WidgetFoo {
  return typeof obj !== 'undefined' && !validateWidgetFoo(obj).length;
}

export function validateNewWidgetFoo(
  params: types.NewWidgetFoo,
): ValidationError[] {
  const errors: ValidationError[] = [];
  if (typeof params.fiz !== 'undefined' && typeof params.fiz !== 'number') {
    errors.push({
      code: 'TYPE',
      title: '"fiz" must be a number if supplied',
      path: 'fiz',
    });
  }
  if (typeof params.buzz === 'undefined') {
    errors.push({
      code: 'REQUIRED',
      title: '"buzz" is required',
      path: 'buzz',
    });
  }
  if (typeof params.buzz !== 'undefined' && typeof params.buzz !== 'number') {
    errors.push({
      code: 'TYPE',
      title: '"buzz" must be a number',
      path: 'buzz',
    });
  }
  return errors;
}
export function isNewWidgetFoo(obj: any): obj is types.NewWidgetFoo {
  return typeof obj !== 'undefined' && !validateNewWidgetFoo(obj).length;
}

export function validateCreateGizmoSize(
  value: types.CreateGizmoSize,
): ValidationError[] {
  const errors: ValidationError[] = [];
  if (
    typeof value === 'string' &&
    !['small', 'medium', 'big', 'XL'].includes(value)
  ) {
    errors.push({
      code: 'STRING_ENUM',
      title: 'Value must be one of ["small", "medium", "big", "XL"]',
      path: '',
    });
  }
  return [];
}

export function validateExhaustiveParamsQueryEnum(
  value: types.ExhaustiveParamsQueryEnum,
): ValidationError[] {
  const errors: ValidationError[] = [];
  if (typeof value === 'string' && !['one', 'two', 'three'].includes(value)) {
    errors.push({
      code: 'STRING_ENUM',
      title: 'Value must be one of ["one", "two", "three"]',
      path: '',
    });
  }
  return [];
}

export function validateExhaustiveParamsQueryEnumArray(
  value: types.ExhaustiveParamsQueryEnumArray,
): ValidationError[] {
  const errors: ValidationError[] = [];
  if (typeof value === 'string' && !['one', 'two', 'three'].includes(value)) {
    errors.push({
      code: 'STRING_ENUM',
      title: 'Value must be one of ["one", "two", "three"]',
      path: '',
    });
  }
  return [];
}

export function validateExhaustiveParamsPathEnum(
  value: types.ExhaustiveParamsPathEnum,
): ValidationError[] {
  const errors: ValidationError[] = [];
  if (typeof value === 'string' && !['one', 'two', 'three'].includes(value)) {
    errors.push({
      code: 'STRING_ENUM',
      title: 'Value must be one of ["one", "two", "three"]',
      path: '',
    });
  }
  return [];
}

export function validateExhaustiveParamsPathEnumArray(
  value: types.ExhaustiveParamsPathEnumArray,
): ValidationError[] {
  const errors: ValidationError[] = [];
  if (typeof value === 'string' && !['one', 'two', 'three'].includes(value)) {
    errors.push({
      code: 'STRING_ENUM',
      title: 'Value must be one of ["one", "two", "three"]',
      path: '',
    });
  }
  return [];
}

export function validateExhaustiveParamsHeaderEnum(
  value: types.ExhaustiveParamsHeaderEnum,
): ValidationError[] {
  const errors: ValidationError[] = [];
  if (typeof value === 'string' && !['one', 'two', 'three'].includes(value)) {
    errors.push({
      code: 'STRING_ENUM',
      title: 'Value must be one of ["one", "two", "three"]',
      path: '',
    });
  }
  return [];
}

export function validateExhaustiveParamsHeaderEnumArray(
  value: types.ExhaustiveParamsHeaderEnumArray,
): ValidationError[] {
  const errors: ValidationError[] = [];
  if (typeof value === 'string' && !['one', 'two', 'three'].includes(value)) {
    errors.push({
      code: 'STRING_ENUM',
      title: 'Value must be one of ["one", "two", "three"]',
      path: '',
    });
  }
  return [];
}

export function validateProductSize(
  value: types.ProductSize,
): ValidationError[] {
  const errors: ValidationError[] = [];
  if (
    typeof value === 'string' &&
    !['small', 'medium', 'large'].includes(value)
  ) {
    errors.push({
      code: 'STRING_ENUM',
      title: 'Value must be one of ["small", "medium", "large"]',
      path: '',
    });
  }
  return [];
}
