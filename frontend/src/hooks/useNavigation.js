import { useState, useCallback } from 'react'

export const useNavigation = (initialPage = 'main') => {
  const [currentPage, setCurrentPage] = useState(initialPage)

  const navigate = useCallback((page) => {
    setCurrentPage(page)
  }, [])

  return {
    currentPage,
    navigate
  }
}