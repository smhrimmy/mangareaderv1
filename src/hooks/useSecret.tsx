import { createContext, useContext, useState, useEffect, ReactNode, createElement } from "react";
import { toast } from "sonner";

interface SecretContextType {
  isUnlocked: boolean;
  pin: string | null;
  unlock: (inputPin: string) => boolean;
  lock: () => void;
  setPin: (newPin: string) => void;
  isSecretEnabled: boolean;
  toggleSecretEnabled: (enabled: boolean) => void;
}

const SecretContext = createContext<SecretContextType | undefined>(undefined);

export const SecretProvider = ({ children }: { children: ReactNode }) => {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [pin, setPinState] = useState<string | null>(localStorage.getItem("secret_pin"));
  const [isSecretEnabled, setIsSecretEnabled] = useState(localStorage.getItem("secret_enabled") === "true");

  useEffect(() => {
    if (pin) localStorage.setItem("secret_pin", pin);
    else localStorage.removeItem("secret_pin");
  }, [pin]);

  useEffect(() => {
    localStorage.setItem("secret_enabled", isSecretEnabled.toString());
    if (!isSecretEnabled) {
      setIsUnlocked(false);
    }
  }, [isSecretEnabled]);

  const unlock = (inputPin: string) => {
    if (inputPin === pin) {
      setIsUnlocked(true);
      toast.success("Welcome to the Vault");
      return true;
    }
    toast.error("Incorrect PIN");
    return false;
  };

  const lock = () => {
    setIsUnlocked(false);
    toast.info("Vault locked");
  };

  const setPin = (newPin: string) => {
    setPinState(newPin);
    toast.success("Vault PIN updated");
  };

  const toggleSecretEnabled = (enabled: boolean) => {
    setIsSecretEnabled(enabled);
    if (!enabled) setIsUnlocked(false);
  };

  const value = {
    isUnlocked,
    pin,
    unlock,
    lock,
    setPin,
    isSecretEnabled,
    toggleSecretEnabled
  };

  return createElement(SecretContext.Provider, { value }, children);
};

export const useSecret = () => {
  const context = useContext(SecretContext);
  if (context === undefined) {
    throw new Error("useSecret must be used within a SecretProvider");
  }
  return context;
};
