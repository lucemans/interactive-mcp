const DEFAULT_TERMINAL_TEMPLATE = 'konsole -e bash -lc {command}';

const PRESET_TEMPLATES: Record<string, string> = {
  console: DEFAULT_TERMINAL_TEMPLATE,
  konsole: DEFAULT_TERMINAL_TEMPLATE,
  'gnome-terminal': 'gnome-terminal -- bash -lc {command}',
  'xfce4-terminal': 'xfce4-terminal -e bash -lc {command}',
  'x-terminal-emulator': 'x-terminal-emulator -e bash -lc {command}',
  xterm: 'xterm -e bash -lc {command}',
  alacritty: 'alacritty -e bash -lc {command}',
  kitty: 'kitty sh -c {command}',
  wezterm: 'wezterm start -- bash -lc {command}',
  tilix: 'tilix -e bash -lc {command}',
  'mate-terminal': 'mate-terminal -e bash -lc {command}',
};

const PLACEHOLDER = '{command}';

function normalizeTemplateInput(input?: string): string | undefined {
  if (!input) {
    return undefined;
  }

  const trimmed = input.trim();
  if (!trimmed) {
    return undefined;
  }

  const preset = PRESET_TEMPLATES[trimmed as keyof typeof PRESET_TEMPLATES];
  if (preset) {
    return preset;
  }

  return trimmed;
}

function ensureTemplateHasPlaceholder(template: string): string {
  if (template.includes(PLACEHOLDER)) {
    return template;
  }
  return `${template} ${PLACEHOLDER}`.trim();
}

function shellQuote(args: string[]): string {
  return args
    .map((arg) => {
      if (arg === '') {
        return "''";
      }
      return `'${arg.replace(/'/g, "'\\''")}'`;
    })
    .join(' ');
}

export interface TerminalLaunchConfig {
  template: string;
}

export function resolveTerminalLaunchConfig(
  option?: string,
): TerminalLaunchConfig {
  const envOverride = process.env.INTERACTIVE_MCP_TERMINAL?.trim();
  const terminalEnv = process.env.TERMINAL?.trim();

  const normalizedOption =
    normalizeTemplateInput(option) ??
    normalizeTemplateInput(envOverride) ??
    normalizeTemplateInput(terminalEnv) ??
    DEFAULT_TERMINAL_TEMPLATE;

  return {
    template: ensureTemplateHasPlaceholder(normalizedOption),
  };
}

export function buildTerminalShellCommand(
  config: TerminalLaunchConfig,
  nodeArgs: string[],
): string {
  const nodeCommand = shellQuote(nodeArgs);
  return ensureTemplateHasPlaceholder(config.template).replace(
    PLACEHOLDER,
    nodeCommand,
  );
}
