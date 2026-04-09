export interface ThemeConfig {
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    primaryContainer?: string;
    onPrimaryContainer?: string;
    secondaryContainer?: string;
    tertiary?: string;
    tertiaryContainer?: string;
    surface?: string;
    surfaceContainerLow?: string;
    surfaceContainerHigh?: string;
    surfaceContainerHighest?: string;
    surfaceContainerLowest?: string;
    onSurface?: string;
    onSurfaceVariant?: string;
    inverseSurface?: string;
    inverseOnSurface?: string;
  };
  copy: {
    heroTitle: string;
    heroHighlight?: string;
    heroSubtitle: string;
    searchPlaceholder: string;
    searchButton: string;
    ctaMain?: string;
    ctaSecondary?: string;
    trustAuthorized?: string;
    trustCertified?: string;
    projectsCompleted?: string;
    guaranteeBadge?: string;
  };
  logos: {
    main: string;
  };
  icons?: {
    solar?: string;
    heatPumps?: string;
    battery?: string;
    evCharging?: string;
  };
  badges: {
    certified: string[];
  };
}
