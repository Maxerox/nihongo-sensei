export const tabId = (prefix: string, id: string) => `${prefix}-tab-${id}`
export const panelId = (prefix: string) => `${prefix}-panel`

/** Props para el panel que controla un grupo de pestañas. */
export const tabPanelProps = (prefix: string, selected: string) => ({
  id: panelId(prefix),
  role: 'tabpanel' as const,
  'aria-labelledby': tabId(prefix, selected),
  tabIndex: 0,
})
