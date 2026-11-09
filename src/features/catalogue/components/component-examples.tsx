"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  Modal,
  ModalTrigger,
  ModalContent,
  ModalBody,
  ModalFooter,
  ModalClose,
} from "@/components/ui/modal";

export function ModalExamples() {
  const [lastAction, setLastAction] = useState<string | null>(null);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        {/* Demo 1: Default / Medium Modal */}
        <Modal>
          <ModalTrigger asChild>
            <Button variant="primary" size="md">
              Open Default Modal (md)
            </Button>
          </ModalTrigger>
          <ModalContent
            variant="default"
            size="md"
            title="Confirm Order Dispatch"
            description="Review dispatch parameters before notifying fulfillment carriers."
          >
            <ModalBody className="space-y-3">
              <p className="text-foreground">
                You are about to release order{" "}
                <span className="font-mono font-semibold text-primary">
                  #ORD-7821
                </span>{" "}
                for immediate carrier pickup.
              </p>
              <div className="rounded-md border border-border bg-muted p-3 text-caption text-muted-foreground">
                Destination: Logistics Hub B &bull; Estimated departure: 14:00
                UTC
              </div>
            </ModalBody>
            <ModalFooter>
              <ModalClose asChild>
                <Button variant="secondary" size="md">
                  Cancel
                </Button>
              </ModalClose>
              <ModalClose asChild>
                <Button
                  variant="primary"
                  size="md"
                  onClick={() => setLastAction("Dispatched #ORD-7821")}
                >
                  Confirm Dispatch
                </Button>
              </ModalClose>
            </ModalFooter>
          </ModalContent>
        </Modal>

        {/* Demo 2: Destructive / Small Modal */}
        <Modal>
          <ModalTrigger asChild>
            <Button variant="destructive" size="md">
              Open Destructive Modal (sm)
            </Button>
          </ModalTrigger>
          <ModalContent
            variant="destructive"
            size="sm"
            title="Cancel Fulfillment Order"
            description="This action is immediate and marks the allocated inventory as returned."
          >
            <ModalBody className="space-y-3">
              <p className="text-foreground">
                Are you sure you want to cancel order{" "}
                <span className="font-mono font-semibold text-destructive">
                  #ORD-7821
                </span>
                ? This operation cannot be reversed.
              </p>
            </ModalBody>
            <ModalFooter>
              <ModalClose asChild>
                <Button variant="secondary" size="md">
                  Dismiss
                </Button>
              </ModalClose>
              <ModalClose asChild>
                <Button
                  variant="destructive"
                  size="md"
                  onClick={() => setLastAction("Cancelled #ORD-7821")}
                >
                  Cancel Order
                </Button>
              </ModalClose>
            </ModalFooter>
          </ModalContent>
        </Modal>

        {/* Demo 3: Muted / Large Modal */}
        <Modal>
          <ModalTrigger asChild>
            <Button variant="secondary" size="md">
              Open Muted Modal (lg)
            </Button>
          </ModalTrigger>
          <ModalContent
            variant="muted"
            size="lg"
            title="Order Item Breakdown"
            description="Detailed manifest of product quantities, lot codes, and warehouse bays."
          >
            <ModalBody className="space-y-3">
              <div className="rounded-md border border-border bg-surface p-4">
                <div className="flex items-center justify-between pb-2 border-b border-border text-caption font-semibold text-foreground">
                  <span>SKU / Description</span>
                  <span>Qty / Bay</span>
                </div>
                <div className="space-y-2 pt-2 text-caption text-foreground">
                  <div className="flex justify-between">
                    <span>VATEK-Industrial-Sensor-X1</span>
                    <span className="font-mono">40 units &bull; Bay 12</span>
                  </div>
                  <div className="flex justify-between">
                    <span>VATEK-Controller-Pro-2026</span>
                    <span className="font-mono">15 units &bull; Bay 04</span>
                  </div>
                </div>
              </div>
            </ModalBody>
            <ModalFooter>
              <ModalClose asChild>
                <Button variant="secondary" size="md">
                  Close Breakdown
                </Button>
              </ModalClose>
            </ModalFooter>
          </ModalContent>
        </Modal>

        {/* Demo 4: Default / Extra Large Modal (xl) */}
        <Modal>
          <ModalTrigger asChild>
            <Button variant="ghost" size="md">
              Open Audit Log Modal (xl)
            </Button>
          </ModalTrigger>
          <ModalContent
            variant="default"
            size="xl"
            title="System Audit & Lifecycle Trail"
            description="Append-only verification log tracking order state transitions across operators."
          >
            <ModalBody className="space-y-3">
              <div className="space-y-2 text-caption">
                <div className="flex items-center justify-between p-2 rounded bg-muted">
                  <span className="font-mono text-muted-foreground">
                    09:12:04
                  </span>
                  <span className="text-foreground">
                    Order received from EDI Partner gateway
                  </span>
                  <Badge variant="success" size="sm">
                    Ingested
                  </Badge>
                </div>
                <div className="flex items-center justify-between p-2 rounded bg-muted">
                  <span className="font-mono text-muted-foreground">
                    09:15:30
                  </span>
                  <span className="text-foreground">
                    Inventory hold confirmed at Hub B
                  </span>
                  <Badge variant="warning" size="sm">
                    Reserved
                  </Badge>
                </div>
              </div>
            </ModalBody>
            <ModalFooter>
              <ModalClose asChild>
                <Button variant="primary" size="md">
                  Acknowledge Log
                </Button>
              </ModalClose>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </div>

      {lastAction && (
        <p
          role="status"
          aria-live="polite"
          className="text-caption font-medium text-primary"
        >
          Last action: {lastAction}
        </p>
      )}
    </div>
  );
}

export function InteractiveButtonSandbox() {
  const [isLoading, setIsLoading] = useState(false);
  const [clickCount, setClickCount] = useState(0);

  const simulateAsync = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setClickCount((prev) => prev + 1);
    }, 1200);
  };

  return (
    <Card variant="muted" size="sm" className="space-y-3">
      <div className="flex flex-wrap items-center gap-4">
        <Button
          variant="primary"
          size="md"
          loading={isLoading}
          onClick={simulateAsync}
        >
          {isLoading ? "Processing Request..." : "Simulate Async Operation"}
        </Button>

        <Button
          variant="secondary"
          size="sm"
          onClick={() => setIsLoading((prev) => !prev)}
        >
          Toggle Loading State: {isLoading ? "Active" : "Inactive"}
        </Button>
      </div>

      <p className="text-caption text-muted-foreground">
        Interactive operations completed:{" "}
        <span className="font-semibold text-foreground">{clickCount}</span>
      </p>
    </Card>
  );
}

export function InteractiveFormSandbox() {
  const [inputValue, setInputValue] = useState("");
  const [isInvalid, setIsInvalid] = useState(false);
  const [isDisabled, setIsDisabled] = useState(false);
  const [selectValue, setSelectValue] = useState("wh-hub-a");

  return (
    <Card variant="default" size="sm" className="space-y-4">
      <div className="flex flex-wrap gap-4 text-caption">
        <label className="flex items-center gap-2 cursor-pointer text-foreground">
          <input
            type="checkbox"
            checked={isInvalid}
            onChange={(e) => setIsInvalid(e.target.checked)}
            className="rounded border-control-border"
          />
          <span>Toggle Error State (`aria-invalid`)</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer text-foreground">
          <input
            type="checkbox"
            checked={isDisabled}
            onChange={(e) => setIsDisabled(e.target.checked)}
            className="rounded border-control-border"
          />
          <span>Toggle Disabled State</span>
        </label>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="sandbox-input"
            className="block text-caption font-medium text-foreground mb-1"
          >
            Sandbox Text Input
          </label>
          <Input
            id="sandbox-input"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            disabled={isDisabled}
            aria-invalid={isInvalid ? "true" : "false"}
            aria-describedby={isInvalid ? "sandbox-input-err" : undefined}
            placeholder="Type live value..."
          />
          {isInvalid && (
            <p
              id="sandbox-input-err"
              role="alert"
              className="mt-1 text-caption text-destructive"
            >
              Validation error: please enter an approved SKU code.
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="sandbox-select"
            className="block text-caption font-medium text-foreground mb-1"
          >
            Sandbox Select Dropdown
          </label>
          <Select
            id="sandbox-select"
            value={selectValue}
            onChange={(e) => setSelectValue(e.target.value)}
            disabled={isDisabled}
            aria-invalid={isInvalid ? "true" : "false"}
            aria-describedby={isInvalid ? "sandbox-select-err" : undefined}
          >
            <option value="wh-hub-a">Logistics Hub Alpha (Domestic)</option>
            <option value="wh-hub-b">Logistics Hub Bravo (Regional)</option>
            <option value="wh-hub-c">
              Logistics Hub Charlie (International)
            </option>
          </Select>
          {isInvalid && (
            <p
              id="sandbox-select-err"
              role="alert"
              className="mt-1 text-caption text-destructive"
            >
              Selected fulfillment hub is currently at capacity.
            </p>
          )}
        </div>
      </div>
    </Card>
  );
}
