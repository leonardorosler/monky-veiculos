import test from 'node:test'
import assert from 'node:assert/strict'
import { dataFuturaISO, dataLocalISO, inputData, parseDinheiro, propostaExpirada, telefoneValido, whatsappUrl } from '../../../utils/crm.ts'

test('BRL parsing distinguishes grouping from decimals and rejects malformed or unsafe amounts', () => {
  for (const text of ['85.000,90', '85000,90', '85000.90', 'R$ 85.000,90']) assert.equal(parseDinheiro(text), 85000.9)
  assert.equal(parseDinheiro('1.000'), 1000)
  assert.equal(parseDinheiro('0,00'), 0)
  for (const text of ['', '-1', '1e6', 'NaN', '1.23.456', '85,000.90', '12,345', '123abc', '1000000001']) assert.equal(parseDinheiro(text), null, text)
})

test('local calendar conversion rejects impossible dates rather than rolling over', () => {
  assert.ok(dataLocalISO('2028-02-29T10:30'))
  for (const text of ['2027-02-29T10:30', '2028-02-30T10:30', '2028-13-01T10:30', '2028-01-00T10:30', '2028-01-01T24:00', '2028-01-01T10:60', '2028-01-01', '2101-01-01T10:00']) assert.equal(dataLocalISO(text), null, text)
  const valid = '2028-05-10T13:45'
  assert.equal(inputData(dataLocalISO(valid)), valid)
})

test('follow-ups and validity require strictly future dates', () => {
  const text = '2028-05-10T13:45'
  const iso = dataLocalISO(text)
  const instant = new Date(iso).getTime()
  assert.equal(dataFuturaISO(text, instant - 1), iso)
  assert.equal(dataFuturaISO(text, instant), null)
  assert.equal(dataFuturaISO(text, instant + 1), null)
})

test('WhatsApp links normalize country code once and encode user text', () => {
  assert.equal(whatsappUrl('(11) 99999-1234'), 'https://wa.me/5511999991234')
  assert.equal(whatsappUrl('+55 (11) 99999-1234'), 'https://wa.me/5511999991234')
  assert.equal(whatsappUrl('11999991234', 'Proposta #1 & valor'), 'https://wa.me/5511999991234?text=Proposta%20%231%20%26%20valor')
  for (const text of ['', '123', '11111111111', '11999991234<script>', '+1 415 555 1234']) {
    assert.equal(telefoneValido(text), false, text)
    assert.equal(whatsappUrl(text), null, text)
  }
})

test('expired, invalid, or boundary-time proposals cannot be accepted', () => {
  const validadeEm = '2028-05-10T13:45:00.000Z'
  const now = Date.parse(validadeEm)
  assert.equal(propostaExpirada({ status: 'RASCUNHO', validadeEm }, now - 1), false)
  assert.equal(propostaExpirada({ status: 'ENVIADA', validadeEm }, now), true)
  assert.equal(propostaExpirada({ status: 'EXPIRADA', validadeEm }, now - 1), true)
  assert.equal(propostaExpirada({ status: 'ENVIADA', validadeEm: 'invalid' }, now), true)
})
