"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
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
  const t = useTranslations("catalogue.modalExamples");
  const [lastAction, setLastAction] = useState<string | null>(null);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        {/* Demo 1: Default / Medium Modal */}
        <Modal>
          <ModalTrigger asChild>
            <Button variant="primary" size="md">
              {t("modal1Trigger")}
            </Button>
          </ModalTrigger>
          <ModalContent
            variant="default"
            size="md"
            title={t("modal1Title")}
            description={t("modal1Desc")}
            closeLabel={t("closeModal")}
          >
            <ModalBody className="space-y-3">
              <p className="text-foreground">
                {t.rich("modal1Body", {
                  orderId: (chunks) => (
                    <span className="font-mono font-semibold text-primary">
                      {chunks}
                    </span>
                  ),
                })}
              </p>
              <div className="rounded-md border border-border bg-muted p-3 text-caption text-muted-foreground">
                {t("modal1Destination")}
              </div>
            </ModalBody>
            <ModalFooter>
              <ModalClose asChild>
                <Button variant="secondary" size="md">
                  {t("modal1Cancel")}
                </Button>
              </ModalClose>
              <ModalClose asChild>
                <Button
                  variant="primary"
                  size="md"
                  onClick={() =>
                    setLastAction(t("actionDispatched", { id: "#ORD-7821" }))
                  }
                >
                  {t("modal1Confirm")}
                </Button>
              </ModalClose>
            </ModalFooter>
          </ModalContent>
        </Modal>

        {/* Demo 2: Destructive / Small Modal */}
        <Modal>
          <ModalTrigger asChild>
            <Button variant="destructive" size="md">
              {t("modal2Trigger")}
            </Button>
          </ModalTrigger>
          <ModalContent
            variant="destructive"
            size="sm"
            title={t("modal2Title")}
            description={t("modal2Desc")}
            closeLabel={t("closeModal")}
          >
            <ModalBody className="space-y-3">
              <p className="text-foreground">
                {t.rich("modal2Body", {
                  orderId: (chunks) => (
                    <span className="font-mono font-semibold text-destructive">
                      {chunks}
                    </span>
                  ),
                })}
              </p>
            </ModalBody>
            <ModalFooter>
              <ModalClose asChild>
                <Button variant="secondary" size="md">
                  {t("modal2Dismiss")}
                </Button>
              </ModalClose>
              <ModalClose asChild>
                <Button
                  variant="destructive"
                  size="md"
                  onClick={() =>
                    setLastAction(t("actionCancelled", { id: "#ORD-7821" }))
                  }
                >
                  {t("modal2Confirm")}
                </Button>
              </ModalClose>
            </ModalFooter>
          </ModalContent>
        </Modal>

        {/* Demo 3: Muted / Large Modal */}
        <Modal>
          <ModalTrigger asChild>
            <Button variant="secondary" size="md">
              {t("modal3Trigger")}
            </Button>
          </ModalTrigger>
          <ModalContent
            variant="muted"
            size="lg"
            title={t("modal3Title")}
            description={t("modal3Desc")}
            closeLabel={t("closeModal")}
          >
            <ModalBody className="space-y-3">
              <div className="rounded-md border border-border bg-surface p-4">
                <div className="flex items-center justify-between pb-2 border-b border-border text-caption font-semibold text-foreground">
                  <span>{t("manifestSkuHeader")}</span>
                  <span>{t("manifestQtyHeader")}</span>
                </div>
                <div className="space-y-2 pt-2 text-caption text-foreground">
                  <div className="flex justify-between">
                    <span>VATEK-Industrial-Sensor-X1</span>
                    <span className="font-mono">{t("manifestRow1Units")}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>VATEK-Controller-Pro-2026</span>
                    <span className="font-mono">{t("manifestRow2Units")}</span>
                  </div>
                </div>
              </div>
            </ModalBody>
            <ModalFooter>
              <ModalClose asChild>
                <Button variant="secondary" size="md">
                  {t("modal3Close")}
                </Button>
              </ModalClose>
            </ModalFooter>
          </ModalContent>
        </Modal>

        {/* Demo 4: Default / Extra Large Modal (xl) */}
        <Modal>
          <ModalTrigger asChild>
            <Button variant="ghost" size="md">
              {t("modal4Trigger")}
            </Button>
          </ModalTrigger>
          <ModalContent
            variant="default"
            size="xl"
            title={t("modal4Title")}
            description={t("modal4Desc")}
            closeLabel={t("closeModal")}
          >
            <ModalBody className="space-y-3">
              <div className="space-y-2 text-caption">
                <div className="flex items-center justify-between p-2 rounded bg-muted">
                  <span className="font-mono text-muted-foreground">
                    09:12:04
                  </span>
                  <span className="text-foreground">{t("logEntry1Text")}</span>
                  <Badge variant="success" size="sm">
                    {t("logEntry1Badge")}
                  </Badge>
                </div>
                <div className="flex items-center justify-between p-2 rounded bg-muted">
                  <span className="font-mono text-muted-foreground">
                    09:15:30
                  </span>
                  <span className="text-foreground">{t("logEntry2Text")}</span>
                  <Badge variant="warning" size="sm">
                    {t("logEntry2Badge")}
                  </Badge>
                </div>
              </div>
            </ModalBody>
            <ModalFooter>
              <ModalClose asChild>
                <Button variant="primary" size="md">
                  {t("modal4Ack")}
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
          {t("lastAction", { action: lastAction })}
        </p>
      )}
    </div>
  );
}

export function InteractiveButtonSandbox() {
  const t = useTranslations("catalogue.buttonSandbox");
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
          {isLoading ? t("processing") : t("simulateAsync")}
        </Button>

        <Button
          variant="secondary"
          size="sm"
          onClick={() => setIsLoading((prev) => !prev)}
        >
          {t("toggleLoading", {
            state: isLoading ? t("stateActive") : t("stateInactive"),
          })}
        </Button>
      </div>

      <p className="text-caption text-muted-foreground">
        {t("completed", { count: clickCount })}
      </p>
    </Card>
  );
}

export function InteractiveFormSandbox() {
  const t = useTranslations("catalogue.formSandbox");
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
          <span>{t("toggleError")}</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer text-foreground">
          <input
            type="checkbox"
            checked={isDisabled}
            onChange={(e) => setIsDisabled(e.target.checked)}
            className="rounded border-control-border"
          />
          <span>{t("toggleDisabled")}</span>
        </label>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="sandbox-input"
            className="block text-caption font-medium text-foreground mb-1"
          >
            {t("inputLabel")}
          </label>
          <Input
            id="sandbox-input"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            disabled={isDisabled}
            aria-invalid={isInvalid ? "true" : "false"}
            aria-describedby={isInvalid ? "sandbox-input-err" : undefined}
            placeholder={t("inputPlaceholder")}
          />
          {isInvalid && (
            <p
              id="sandbox-input-err"
              role="alert"
              className="mt-1 text-caption text-destructive"
            >
              {t("inputError")}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="sandbox-select"
            className="block text-caption font-medium text-foreground mb-1"
          >
            {t("selectLabel")}
          </label>
          <Select
            id="sandbox-select"
            value={selectValue}
            onChange={(e) => setSelectValue(e.target.value)}
            disabled={isDisabled}
            aria-invalid={isInvalid ? "true" : "false"}
            aria-describedby={isInvalid ? "sandbox-select-err" : undefined}
          >
            <option value="wh-hub-a">{t("optionHubA")}</option>
            <option value="wh-hub-b">{t("optionHubB")}</option>
            <option value="wh-hub-c">{t("optionHubC")}</option>
          </Select>
          {isInvalid && (
            <p
              id="sandbox-select-err"
              role="alert"
              className="mt-1 text-caption text-destructive"
            >
              {t("selectError")}
            </p>
          )}
        </div>
      </div>
    </Card>
  );
}
