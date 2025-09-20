// Setup file для тестов
import { expect, afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'
import * as matchers from '@testing-library/jest-dom/matchers'

// Расширяем expect с jest-dom matchers
expect.extend(matchers)

// Очищаем после каждого теста
afterEach(() => {
  cleanup()
})
