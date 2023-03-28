export default function setup_service_worker() {
  if (location.protocol === "https:" && navigator.serviceWorker)
    navigator.serviceWorker.register(
      new URL("/common/utils/service_worker.js", import.meta.url),
      { scope: "/" }
    )
  navigator.serviceWorker
    ?.getRegistrations()
    .then((reg) => console.log("Registrations:", reg))
}
