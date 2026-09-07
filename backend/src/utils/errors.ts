export class AppError extends Error {
  readonly statusCode: number;
  readonly code: string;

  constructor(statusCode: number, code: string, message: string) {
    super(message);
    this.name = "AppError";
    this.statusCode = statusCode;
    this.code = code;
  }
}

export const Errors = {
  invalidQuery: () =>
    new AppError(400, "INVALID_QUERY", "Search query is required."),
  invalidLanguage: () =>
    new AppError(400, "INVALID_LANGUAGE", "Language must be one of: en, nl, de, fr."),
  productNotFound: () =>
    new AppError(404, "PRODUCT_NOT_FOUND", "Product was not found."),
  productSearchFailed: () =>
    new AppError(502, "PRODUCT_SEARCH_FAILED", "Unable to search products."),
  productLookupFailed: () =>
    new AppError(502, "PRODUCT_LOOKUP_FAILED", "Unable to load this product."),
  databaseFailure: () =>
    new AppError(500, "DATABASE_FAILURE", "Unable to complete this request."),
  checkoutFailed: () =>
    new AppError(502, "STRIPE_CHECKOUT_FAILED", "Unable to start checkout."),
  webhookVerificationFailed: () =>
    new AppError(400, "WEBHOOK_VERIFICATION_FAILED", "Webhook signature is invalid."),
  demoUserMissing: () =>
    new AppError(500, "DEMO_USER_MISSING", "Demo user is not initialized."),
};
