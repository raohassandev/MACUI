import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { v4 as uuidv4 } from 'uuid';

// Define component types that can be dragged onto the layout
export type ComponentType = 
  | 'card' 
  | 'button' 
  | 'text' 
  | 'input' 
  | 'select'
  | 'image'
  | 'heading'
  | 'divider';

// Define component position and size
export interface ComponentPosition {
  id: string;
  type: ComponentType;
  x: number;
  y: number;
  width: number;
  height: number;
  props?: Record<string, any>;
}

// Define the layout structure
export interface Layout {
  id: string;
  name: string;
  components: ComponentPosition[];
}

// Define the context state
interface LayoutBuilderState {
  layouts: Layout[];
  currentLayout: Layout | null;
  components: { type: ComponentType; label: string; icon: string }[];
  selectedComponent: string | null;
}

// Define action types
type LayoutBuilderAction =
  | { type: 'SET_CURRENT_LAYOUT'; payload: string }
  | { type: 'CREATE_LAYOUT'; payload: { name: string } }
  | { type: 'ADD_COMPONENT'; payload: { type: ComponentType; x: number; y: number; props?: Record<string, any> } }
  | { type: 'MOVE_COMPONENT'; payload: { id: string; x: number; y: number } }
  | { type: 'RESIZE_COMPONENT'; payload: { id: string; width: number; height: number } }
  | { type: 'REMOVE_COMPONENT'; payload: { id: string } }
  | { type: 'UPDATE_COMPONENT_PROPS'; payload: { id: string; props: Record<string, any> } }
  | { type: 'SELECT_COMPONENT'; payload: string | null }
  | { type: 'SAVE_LAYOUT' }
  | { type: 'LOAD_LAYOUTS' };

// Define the context interface
interface LayoutBuilderContextType {
  state: LayoutBuilderState;
  dispatch: React.Dispatch<LayoutBuilderAction>;
  addComponent: (type: ComponentType, x: number, y: number, props?: Record<string, any>) => void;
  moveComponent: (id: string, x: number, y: number) => void;
  resizeComponent: (id: string, width: number, height: number) => void;
  removeComponent: (id: string) => void;
  updateComponentProps: (id: string, props: Record<string, any>) => void;
  selectComponent: (id: string | null) => void;
  createLayout: (name: string) => void;
  setCurrentLayout: (id: string) => void;
  saveLayout: () => void;
}

// Create available component catalog
const availableComponents = [
  { type: 'card' as ComponentType, label: 'Card', icon: '🃏' },
  { type: 'button' as ComponentType, label: 'Button', icon: '🔘' },
  { type: 'text' as ComponentType, label: 'Text', icon: '📝' },
  { type: 'input' as ComponentType, label: 'Input', icon: '📋' },
  { type: 'select' as ComponentType, label: 'Select', icon: '📊' },
  { type: 'image' as ComponentType, label: 'Image', icon: '🖼️' },
  { type: 'heading' as ComponentType, label: 'Heading', icon: '📌' },
  { type: 'divider' as ComponentType, label: 'Divider', icon: '➖' },
];

// Initial state
const initialState: LayoutBuilderState = {
  layouts: [],
  currentLayout: null,
  components: availableComponents,
  selectedComponent: null,
};

// Reducer function
function layoutBuilderReducer(state: LayoutBuilderState, action: LayoutBuilderAction): LayoutBuilderState {
  switch (action.type) {
    case 'SET_CURRENT_LAYOUT':
      return {
        ...state,
        currentLayout: state.layouts.find(layout => layout.id === action.payload) || state.currentLayout,
        selectedComponent: null,
      };
    case 'CREATE_LAYOUT':
      const newLayout: Layout = {
        id: uuidv4(),
        name: action.payload.name,
        components: [],
      };
      return {
        ...state,
        layouts: [...state.layouts, newLayout],
        currentLayout: newLayout,
        selectedComponent: null,
      };
    case 'ADD_COMPONENT':
      if (!state.currentLayout) return state;
      
      const newComponent: ComponentPosition = {
        id: uuidv4(),
        type: action.payload.type,
        x: action.payload.x,
        y: action.payload.y,
        width: 200, // Default width
        height: 100, // Default height
        props: action.payload.props || {},
      };
      
      return {
        ...state,
        currentLayout: {
          ...state.currentLayout,
          components: [...state.currentLayout.components, newComponent],
        },
        selectedComponent: newComponent.id,
      };
    case 'MOVE_COMPONENT':
      if (!state.currentLayout) return state;
      
      return {
        ...state,
        currentLayout: {
          ...state.currentLayout,
          components: state.currentLayout.components.map(component => 
            component.id === action.payload.id 
              ? { ...component, x: action.payload.x, y: action.payload.y } 
              : component
          ),
        },
      };
    case 'RESIZE_COMPONENT':
      if (!state.currentLayout) return state;
      
      return {
        ...state,
        currentLayout: {
          ...state.currentLayout,
          components: state.currentLayout.components.map(component => 
            component.id === action.payload.id 
              ? { ...component, width: action.payload.width, height: action.payload.height } 
              : component
          ),
        },
      };
    case 'REMOVE_COMPONENT':
      if (!state.currentLayout) return state;
      
      return {
        ...state,
        currentLayout: {
          ...state.currentLayout,
          components: state.currentLayout.components.filter(component => 
            component.id !== action.payload.id
          ),
        },
        selectedComponent: state.selectedComponent === action.payload.id ? null : state.selectedComponent,
      };
    case 'UPDATE_COMPONENT_PROPS':
      if (!state.currentLayout) return state;
      
      return {
        ...state,
        currentLayout: {
          ...state.currentLayout,
          components: state.currentLayout.components.map(component => 
            component.id === action.payload.id 
              ? { ...component, props: { ...component.props, ...action.payload.props } } 
              : component
          ),
        },
      };
    case 'SELECT_COMPONENT':
      return {
        ...state,
        selectedComponent: action.payload,
      };
    case 'SAVE_LAYOUT':
      if (!state.currentLayout) return state;
      
      // Find the layout in the array and update it
      const updatedLayouts = state.layouts.map(layout => 
        layout.id === state.currentLayout?.id ? state.currentLayout : layout
      );
      
      // Save to localStorage
      localStorage.setItem('layouts', JSON.stringify(updatedLayouts));
      
      return {
        ...state,
        layouts: updatedLayouts,
      };
    case 'LOAD_LAYOUTS':
      const savedLayouts = localStorage.getItem('layouts');
      if (!savedLayouts) return state;
      
      const parsedLayouts: Layout[] = JSON.parse(savedLayouts);
      return {
        ...state,
        layouts: parsedLayouts,
        currentLayout: parsedLayouts.length > 0 ? parsedLayouts[0] : null,
      };
    default:
      return state;
  }
}

// Create context
const LayoutBuilderContext = createContext<LayoutBuilderContextType | undefined>(undefined);

// Provider component
interface LayoutBuilderProviderProps {
  children: ReactNode;
}

export const LayoutBuilderProvider: React.FC<LayoutBuilderProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(layoutBuilderReducer, initialState);
  
  // Load layouts on initial mount
  useEffect(() => {
    dispatch({ type: 'LOAD_LAYOUTS' });
  }, []);
  
  // Helper functions for common actions
  const addComponent = (type: ComponentType, x: number, y: number, props?: Record<string, any>) => {
    dispatch({ type: 'ADD_COMPONENT', payload: { type, x, y, props } });
  };
  
  const moveComponent = (id: string, x: number, y: number) => {
    dispatch({ type: 'MOVE_COMPONENT', payload: { id, x, y } });
  };
  
  const resizeComponent = (id: string, width: number, height: number) => {
    dispatch({ type: 'RESIZE_COMPONENT', payload: { id, width, height } });
  };
  
  const removeComponent = (id: string) => {
    dispatch({ type: 'REMOVE_COMPONENT', payload: { id } });
  };
  
  const updateComponentProps = (id: string, props: Record<string, any>) => {
    dispatch({ type: 'UPDATE_COMPONENT_PROPS', payload: { id, props } });
  };
  
  const selectComponent = (id: string | null) => {
    dispatch({ type: 'SELECT_COMPONENT', payload: id });
  };
  
  const createLayout = (name: string) => {
    dispatch({ type: 'CREATE_LAYOUT', payload: { name } });
  };
  
  const setCurrentLayout = (id: string) => {
    dispatch({ type: 'SET_CURRENT_LAYOUT', payload: id });
  };
  
  const saveLayout = () => {
    dispatch({ type: 'SAVE_LAYOUT' });
  };
  
  return (
    <LayoutBuilderContext.Provider value={{
      state,
      dispatch,
      addComponent,
      moveComponent,
      resizeComponent,
      removeComponent,
      updateComponentProps,
      selectComponent,
      createLayout,
      setCurrentLayout,
      saveLayout,
    }}>
      {children}
    </LayoutBuilderContext.Provider>
  );
};

// Custom hook for using the context
export const useLayoutBuilder = (): LayoutBuilderContextType => {
  const context = useContext(LayoutBuilderContext);
  
  if (context === undefined) {
    throw new Error('useLayoutBuilder must be used within a LayoutBuilderProvider');
  }
  
  return context;
};