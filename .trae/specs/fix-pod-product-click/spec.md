# Fix POD Product Click Spec

## Why
Currently, clicking on Easy Street (POD) product cards navigates to `/go/[slug]` because the card is wrapped in an `<a>` tag intended for affiliate links. Since POD products don't have affiliate links, the `/go/[slug]` route redirects to the homepage. The user expects clicking the product to add it to the cart instead.

## What Changes
- Create a new Client Component `PodCardWrapper` in `src/components/PodCardWrapper.tsx` to handle adding POD products to the cart when the entire card is clicked.
- Refactor `src/components/ProductCard.tsx` to extract the inner card content and conditionally wrap it in `PodCardWrapper` for POD products, while keeping the existing `<a>` tag wrapper for affiliate products.
- Replace the interactive `AddToCartButton` inside `ProductCard` with a static visual button (`<div className="text-center ...">Add to Cart</div>`) for POD products, since the entire `PodCardWrapper` will now handle the click event.
- Delete `src/components/AddToCartButton.tsx` as it is no longer needed.

## Impact
- Affected specs: POD e-commerce checkout flow, Product Grid rendering.
- Affected code: 
  - `src/components/ProductCard.tsx`
  - `src/components/PodCardWrapper.tsx`
  - `src/components/AddToCartButton.tsx`

## ADDED Requirements
### Requirement: POD Card Click to Cart
The system SHALL intercept clicks anywhere on a POD product card and add the item to the shopping cart, preventing any navigation away from the current page.

#### Scenario: Success case
- **WHEN** user clicks on the image, title, or visual "Add to Cart" button of an Easy Street product.
- **THEN** the product is added to the shopping cart.
- **AND** the shopping cart drawer opens (handled by `use-shopping-cart` context if configured).

## MODIFIED Requirements
### Requirement: Affiliate Card Click
Affiliate cards remain wrapped in `<a>` tags pointing to `/go/[slug]` and will continue to navigate to the affiliate redirect route when clicked.
