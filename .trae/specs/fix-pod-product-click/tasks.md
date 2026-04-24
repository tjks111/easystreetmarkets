# Tasks

- [ ] Task 1: Create `PodCardWrapper.tsx` Client Component.
  - [ ] SubTask 1.1: Implement `PodCardWrapper` to accept `product` and `children`.
  - [ ] SubTask 1.2: Add an `onClick` and `onKeyDown` handler to call `addItem` from `useShoppingCart` with the product's details.
  - [ ] SubTask 1.3: Apply styling (`cursor-pointer group flex flex-col bg-white rounded-lg border border-foreground/5 hover:border-forest/40 hover:shadow-lg transition-all overflow-hidden`).
- [ ] Task 2: Refactor `ProductCard.tsx` to use the wrapper.
  - [ ] SubTask 2.1: Extract the card content into a shared JSX variable (`content`).
  - [ ] SubTask 2.2: Replace the interactive `AddToCartButton` with a visual `div` styled as a button.
  - [ ] SubTask 2.3: Conditionally wrap `content` in `PodCardWrapper` if `product.product_type === 'pod'`, otherwise wrap in the existing `<a>` tag.
- [ ] Task 3: Cleanup redundant components.
  - [ ] SubTask 3.1: Delete `src/components/AddToCartButton.tsx`.

# Task Dependencies
- Task 2 depends on Task 1.
- Task 3 depends on Task 2.
