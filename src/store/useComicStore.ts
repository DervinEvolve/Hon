import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { nanoid } from 'nanoid';
import { Comic, Panel } from '../types';

interface ComicStore {
  publishedComics: Comic[];
  currentComic: Comic | null;
  currentPageIndex: number;
  isCreatorMode: boolean;
  setCurrentComic: (comic: Comic | null) => void;
  updateComicTitle: (title: string) => void;
  updateComicCover: (cover: { url: string; type: 'image' | 'video' | 'gif' }) => void;
  addPanel: (panel: Panel, pageIndex: number) => void;
  updatePanel: (panel: Panel, pageIndex: number) => void;
  removePanel: (panelId: string, pageIndex: number) => void;
  reorderPanels: (startIndex: number, endIndex: number, pageIndex: number) => void;
  addPage: () => void;
  removePage: (pageIndex: number) => void;
  setCurrentPageIndex: (index: number) => void;
  publishComic: () => void;
  unpublishComic: (comicId: string) => void;
  toggleCreatorMode: () => void;
  editComic: (comic: Comic) => void;
}

const processPanel = (panel: Panel): Panel => ({
  ...panel,
  id: panel.id || nanoid(),
  type: panel.type || 'image',
  caption: panel.caption || '',
  captionPosition: panel.captionPosition ? { ...panel.captionPosition } : undefined,
  captionStyle: panel.captionStyle ? { ...panel.captionStyle } : undefined,
  size: panel.size || 'medium',
  position: panel.position ? { ...panel.position } : undefined,
  aspectRatio: panel.aspectRatio || 1,
});

export const useComicStore = create<ComicStore>()(
  persist(
    (set) => ({
      publishedComics: [],
      currentComic: null,
      currentPageIndex: 0,
      isCreatorMode: false,

      setCurrentComic: (comic) => {
        if (!comic) {
          set({ currentComic: null, currentPageIndex: 0, isCreatorMode: false });
          return;
        }

        const processedComic = {
          ...comic,
          id: comic.id || nanoid(),
          coverImage: comic.coverImage || '',
          coverType: comic.coverType || 'image',
          coverPosition: comic.coverPosition ? { ...comic.coverPosition } : undefined,
          pages: comic.pages.map(page => 
            page.map(panel => processPanel(panel))
          ),
        };

        set({
          currentComic: processedComic,
          currentPageIndex: 0,
          isCreatorMode: false,
        });
      },

      editComic: (comic) => {
        const processedComic = {
          ...comic,
          pages: comic.pages.map(page => 
            page.map(panel => processPanel(panel))
          ),
        };

        set({
          currentComic: processedComic,
          currentPageIndex: 0,
          isCreatorMode: true,
        });
      },

      updateComicTitle: (title) => 
        set((state) => ({
          currentComic: state.currentComic ? { ...state.currentComic, title } : null,
        })),

      updateComicCover: (cover) =>
        set((state) => ({
          currentComic: state.currentComic ? {
            ...state.currentComic,
            coverImage: cover.url,
            coverType: cover.type,
          } : null,
        })),

      addPanel: (panel, pageIndex) =>
        set((state) => {
          if (!state.currentComic) return state;
          const newPages = [...state.currentComic.pages];
          if (!newPages[pageIndex]) newPages[pageIndex] = [];
          newPages[pageIndex] = [...newPages[pageIndex], processPanel(panel)];
          return { currentComic: { ...state.currentComic, pages: newPages } };
        }),

      updatePanel: (panel, pageIndex) =>
        set((state) => {
          if (!state.currentComic) return state;
          const newPages = [...state.currentComic.pages];
          const panelIndex = newPages[pageIndex].findIndex(p => p.id === panel.id);
          if (panelIndex === -1) return state;
          newPages[pageIndex][panelIndex] = processPanel(panel);
          return { currentComic: { ...state.currentComic, pages: newPages } };
        }),

      removePanel: (panelId, pageIndex) =>
        set((state) => {
          if (!state.currentComic) return state;
          const newPages = [...state.currentComic.pages];
          newPages[pageIndex] = newPages[pageIndex].filter(p => p.id !== panelId);
          return { currentComic: { ...state.currentComic, pages: newPages } };
        }),

      reorderPanels: (startIndex, endIndex, pageIndex) =>
        set((state) => {
          if (!state.currentComic) return state;
          const newPages = [...state.currentComic.pages];
          const [removed] = newPages[pageIndex].splice(startIndex, 1);
          newPages[pageIndex].splice(endIndex, 0, removed);
          return { currentComic: { ...state.currentComic, pages: newPages } };
        }),

      addPage: () =>
        set((state) => {
          if (!state.currentComic) return state;
          const newPages = [...state.currentComic.pages, []];
          return {
            currentComic: { ...state.currentComic, pages: newPages },
            currentPageIndex: newPages.length - 1,
          };
        }),

      removePage: (pageIndex) =>
        set((state) => {
          if (!state.currentComic || state.currentComic.pages.length <= 1) return state;
          const newPages = state.currentComic.pages.filter((_, i) => i !== pageIndex);
          return {
            currentComic: { ...state.currentComic, pages: newPages },
            currentPageIndex: Math.min(state.currentPageIndex, newPages.length - 1),
          };
        }),

      setCurrentPageIndex: (index) => set({ currentPageIndex: index }),

      publishComic: () =>
        set((state) => {
          if (!state.currentComic) return state;
          const existingIndex = state.publishedComics.findIndex(c => c.id === state.currentComic!.id);
          const updatedComics = [...state.publishedComics];

          if (existingIndex >= 0) {
            updatedComics[existingIndex] = state.currentComic;
          } else {
            updatedComics.push(state.currentComic);
          }

          return {
            publishedComics: updatedComics,
            currentComic: null,
            isCreatorMode: false,
            currentPageIndex: 0,
          };
        }),

      unpublishComic: (comicId) =>
        set((state) => ({
          publishedComics: state.publishedComics.filter(c => c.id !== comicId),
        })),

      toggleCreatorMode: () =>
        set((state) => ({
          isCreatorMode: !state.isCreatorMode,
        })),
    }),
    {
      name: 'comic-storage',
      partialize: (state) => ({
        publishedComics: state.publishedComics.map(comic => ({
          ...comic,
          pages: comic.pages.map(page => 
            page.map(panel => processPanel(panel))
          ),
        })),
      }),
    }
  )
);