import { getRequestConfig } from "next-intl/server";
import { cookies } from "next/headers";

export default getRequestConfig(async () => {
  const cookieStore = await cookies();
  const localeCookie = cookieStore.get("NEXT_LOCALE")?.value;
  const locale = localeCookie === "vi" ? "vi" : "en";

  return {
    locale,
    messages: (
      await (locale === "vi"
        ? import("../../messages/vi.json")
        : import("../../messages/en.json"))
    ).default,
  };
});
