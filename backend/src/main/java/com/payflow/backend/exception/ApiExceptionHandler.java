package com.payflow.backend.exception;

import java.time.Instant;
import java.util.*;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.*;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;

@RestControllerAdvice
public class ApiExceptionHandler {
  record ErrorResponse(
      Instant timestamp,
      int status,
      String error,
      String message,
      Map<String, String> fieldErrors) {}

  @ExceptionHandler(NotFoundException.class)
  @ResponseStatus(HttpStatus.NOT_FOUND)
  ErrorResponse notFound(NotFoundException e) {
    return error(HttpStatus.NOT_FOUND, e.getMessage(), Map.of());
  }

  @ExceptionHandler(BusinessRuleException.class)
  @ResponseStatus(HttpStatus.UNPROCESSABLE_ENTITY)
  ErrorResponse rule(BusinessRuleException e) {
    return error(HttpStatus.UNPROCESSABLE_ENTITY, e.getMessage(), Map.of());
  }

  @ExceptionHandler(MethodArgumentNotValidException.class)
  @ResponseStatus(HttpStatus.BAD_REQUEST)
  ErrorResponse validation(MethodArgumentNotValidException e) {
    Map<String, String> fields = new LinkedHashMap<>();
    e.getBindingResult()
        .getFieldErrors()
        .forEach(f -> fields.put(f.getField(), f.getDefaultMessage()));
    String message =
        fields.getOrDefault(
            "recipientAccountNumber", fields.getOrDefault("amount", "Validation failed"));
    return error(HttpStatus.BAD_REQUEST, message, fields);
  }

  @ExceptionHandler(MethodArgumentTypeMismatchException.class)
  @ResponseStatus(HttpStatus.BAD_REQUEST)
  ErrorResponse typeMismatch(MethodArgumentTypeMismatchException e) {
    return error(HttpStatus.BAD_REQUEST, "Invalid value for '" + e.getName() + "'", Map.of());
  }

  @ExceptionHandler(DataIntegrityViolationException.class)
  @ResponseStatus(HttpStatus.CONFLICT)
  ErrorResponse conflict(DataIntegrityViolationException e) {
    return error(HttpStatus.CONFLICT, "The request conflicts with existing data", Map.of());
  }

  private ErrorResponse error(HttpStatus status, String message, Map<String, String> fields) {
    return new ErrorResponse(
        Instant.now(), status.value(), status.getReasonPhrase(), message, fields);
  }
}
