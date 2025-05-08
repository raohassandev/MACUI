// Text strings used throughout the application
// This centralizes all user-facing text for easy maintenance and localization

export const strings = {
  common: {
    loading: 'Loading...',
    error: 'An error occurred',
    save: 'Save',
    cancel: 'Cancel',
    close: 'Close',
    edit: 'Edit',
    delete: 'Delete',
    submit: 'Submit',
    success: 'Success!',
  },
  components: {
    button: {
      clickMe: 'Click me',
    },
    table: {
      noData: 'No data available',
      rowsPerPage: 'Rows per page',
      of: 'of',
      page: 'Page',
    },
    modal: {
      close: 'Close modal',
    },
    form: {
      required: 'Required',
      invalidEmail: 'Invalid email address',
      invalidPassword: 'Password must be at least 8 characters',
      submit: 'Submit',
    },
  },
  pages: {
    home: {
      title: 'Welcome to the Theme App',
      description: 'A configurable theming system using Shadcn/UI',
    },
  },
};