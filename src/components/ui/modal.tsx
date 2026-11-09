"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/**
 * Modal Primitives (Radix Dialog)
 *
 * Accessible B2B modal dialog adhering to WCAG 2.1 AA/AAA requirements:
 * - Focus containment (Tab / Shift+Tab trapped inside modal)
 * - Dismissal on Escape key
 * - Focus restoration to trigger upon closing
 * - Enforced accessible title and description at compile time
 *
 * @example Standard Usage (Requires title and description):
 * ```tsx
 * <Modal open={isOpen} onOpenChange={setIsOpen}>
 *   <ModalTrigger asChild>
 *     <Button variant="primary">Review Order</Button>
 *   </ModalTrigger>
 *   <ModalContent
 *     title="Review Order #ORD-001"
 *     description="Review customer order details before fulfilling."
 *     variant="default"
 *     size="md"
 *   >
 *     <ModalBody>
 *       <p>Order fulfillment items...</p>
 *     </ModalBody>
 *     <ModalFooter>
 *       <ModalClose asChild>
 *         <Button variant="secondary">Cancel</Button>
 *       </ModalClose>
 *       <Button variant="primary">Fulfill Order</Button>
 *     </ModalFooter>
 *   </ModalContent>
 * </Modal>
 * ```
 *
 * @example Destructive Confirmation Pattern (Requires title and description):
 * ```tsx
 * <Modal open={isOpen} onOpenChange={setIsOpen}>
 *   <ModalTrigger asChild>
 *     <Button variant="destructive">Cancel Order</Button>
 *   </ModalTrigger>
 *   <ModalContent
 *     variant="destructive"
 *     size="sm"
 *     title="Cancel Order Confirmation"
 *     description="Are you sure you want to cancel this order? This action cannot be reversed."
 *   >
 *     <ModalBody>
 *       <p>Customer will receive an automated cancellation notice.</p>
 *     </ModalBody>
 *     <ModalFooter>
 *       <ModalClose asChild>
 *         <Button variant="secondary">Back</Button>
 *       </ModalClose>
 *       <Button variant="destructive">Confirm Cancellation</Button>
 *     </ModalFooter>
 *   </ModalContent>
 * </Modal>
 * ```
 */

export const Modal = DialogPrimitive.Root;
export const ModalTrigger = DialogPrimitive.Trigger;
export const ModalPortal = DialogPrimitive.Portal;
export const ModalClose = DialogPrimitive.Close;

export const modalOverlayVariants = cva(
  "fixed inset-0 z-50 bg-foreground/50 transition-opacity"
);

export const ModalOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(modalOverlayVariants(), className)}
    {...props}
  />
));
ModalOverlay.displayName = DialogPrimitive.Overlay.displayName;

export const modalVariants = cva(
  "relative w-full rounded-lg text-surface-foreground shadow-lg flex flex-col overflow-hidden max-h-full",
  {
    variants: {
      variant: {
        default: "border border-border bg-surface text-surface-foreground",
        destructive:
          "border border-destructive/40 bg-surface text-surface-foreground",
        muted: "border border-border bg-muted text-foreground shadow-md",
      },
      size: {
        sm: "max-w-sm",
        md: "max-w-md",
        lg: "max-w-lg",
        xl: "max-w-xl",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
);

export interface ModalContentProps
  extends Omit<
      React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>,
      "title"
    >,
    VariantProps<typeof modalVariants> {
  title: React.ReactNode;
  description: React.ReactNode;
  showCloseButton?: boolean;
}

export const ModalContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  ModalContentProps
>(
  (
    {
      className,
      children,
      variant,
      size,
      showCloseButton = true,
      title,
      description,
      ...props
    },
    ref
  ) => (
    <ModalPortal>
      <ModalOverlay />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
        <DialogPrimitive.Content
          ref={ref}
          className={cn(modalVariants({ variant, size }), className)}
          {...props}
        >
          <ModalHeader>
            <ModalTitle>{title}</ModalTitle>
            <ModalDescription>{description}</ModalDescription>
          </ModalHeader>
          {children}
          {showCloseButton && (
            <DialogPrimitive.Close
              className="absolute right-4 top-4 rounded-sm p-1 text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 disabled:pointer-events-none"
              aria-label="Close modal"
            >
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
              <span className="sr-only">Close</span>
            </DialogPrimitive.Close>
          )}
        </DialogPrimitive.Content>
      </div>
    </ModalPortal>
  )
);
ModalContent.displayName = DialogPrimitive.Content.displayName;

export const ModalHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn("flex flex-col space-y-1 p-6 pb-2 text-left", className)}
    {...props}
  />
);
ModalHeader.displayName = "ModalHeader";

export const ModalTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn(
      "text-lg font-semibold leading-7 tracking-tight text-foreground",
      className
    )}
    {...props}
  />
));
ModalTitle.displayName = DialogPrimitive.Title.displayName;

export const ModalDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn("text-sm text-muted-foreground leading-5", className)}
    {...props}
  />
));
ModalDescription.displayName = DialogPrimitive.Description.displayName;

export const ModalBody = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex-1 overflow-y-auto px-6 py-2 text-sm leading-5",
      className
    )}
    {...props}
  />
);
ModalBody.displayName = "ModalBody";

export const ModalFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col-reverse sm:flex-row sm:justify-end gap-3 p-6 pt-2",
      className
    )}
    {...props}
  />
);
ModalFooter.displayName = "ModalFooter";
