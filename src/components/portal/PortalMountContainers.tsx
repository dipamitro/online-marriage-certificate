/**
 * Browser-owned DOM mount containers for the Marriage Registration and
 * Registrar Enlistment engines. Preserves exact IDs and attributes so
 * portal.css and template renderers remain visually identical.
 */
export function PortalMountContainers() {
  return (
    <div className="relative min-h-screen w-full">
      <div id="pills" role="navigation" aria-label="Portals" hidden />
      <div id="root" />
      <div className="modal" id="modal" hidden />
      <div id="toast" role="status" />
      <div id="eroot" hidden />
      <div className="modal" id="emodal" hidden />
      <div id="etoast" role="status" />
      <div id="pdfStage" aria-hidden="true" />
      <div id="onb" hidden />
    </div>
  );
}
