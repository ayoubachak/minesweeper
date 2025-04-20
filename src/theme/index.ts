import { extendTheme, type ThemeConfig } from '@chakra-ui/react';

// Color mode configuration
const config: ThemeConfig = {
  initialColorMode: 'light',
  useSystemColorMode: false,
};

// Custom theme
const theme = extendTheme({
  config,
  fonts: {
    heading: `'Inter', sans-serif`,
    body: `'Inter', sans-serif`,
  },
  colors: {
    // Custom colors can be added here
  },
  components: {
    // Component style overrides can go here
    Button: {
      baseStyle: {
        fontWeight: 'semibold',
      },
    },
    Modal: {
      baseStyle: {
        dialog: {
          mx: 4,
        },
      },
    },
  },
  styles: {
    global: (props: any) => ({
      body: {
        bg: props.colorMode === 'dark' ? 'gray.900' : 'gray.50',
      },
    }),
  },
});

export default theme; 