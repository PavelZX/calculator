/* eslint-disable no-unused-expressions */
import R from 'ramda'
import TestUtils from 'react-addons-test-utils'
import baseThemeVariables from 'themes/_base/variables'
import Calculate from 'components/Calculate'
import { render, shallowRender } from '../test-helpers/render'
import createCalculation from '../test-helpers/createCalculation'
import { shouldIgnoreOtherProps, shouldUpdate }
  from '../test-helpers/shouldComponentUpdate'

describe('(Component) Calculate', function () {
  const getStyles = (theme) => {
    return {
      color: theme.dark
    }
  }
  const theme = baseThemeVariables
  let calculation = createCalculation('1+1', 2)
  let component
  let input
  let props
  let rendered
  let spies

  beforeEach(function () {
    spies = {}
    props = {
      calculation,
      getStyles,
      onChange: (spies.onChange = sinon.spy()),
      onKeyPress: (spies.onKeyPress = sinon.spy()),
      onPaste: (spies.onPaste = sinon.spy()),
      onSubmit: (spies.onSubmit = sinon.spy()),
      theme
    }
    component = shallowRender(Calculate, props)
  })

  it('should render as a <div>.', function () {
    expect(component.type).to.equal('div')
  })

  it('should render calculation input', function () {
    rendered = render(Calculate, props)
    input = TestUtils.findRenderedDOMComponentWithClass(
      rendered,
      'calculator-input'
    )
    expect(input.value).to.equal(calculation.input)
  })

  it('should not display output when "input" is empty', function () {
    calculation = { input: '' }
    rendered = render(Calculate, R.merge(props, { calculation }))
    const span = TestUtils.findRenderedDOMComponentWithTag(rendered, 'span')
    expect(span.textContent).to.equal('')
  })

  it('should display ERROR when "isError"', function () {
    calculation = createCalculation('5+', null, true)
    rendered = render(Calculate, R.merge(props, { calculation }))
    const span = TestUtils.findRenderedDOMComponentWithTag(rendered, 'span')
    expect(span.textContent).to.equal('Ans = ERROR')
  })

  it('should display "output" when "input" is not empty and not "isError"',
    function () {
      const output = 10
      calculation = createCalculation('5+5', output)
      rendered = render(Calculate, R.merge(props, { calculation }))
      const span = TestUtils.findRenderedDOMComponentWithTag(rendered, 'span')
      expect(span.textContent).to.equal(`Ans = ${output}`)
    }
  )

  it('should dispatch onChange when input has changed', function () {
    rendered = render(Calculate, props)
    input = TestUtils.findRenderedDOMComponentWithClass(
      rendered,
      'calculator-input'
    )
    TestUtils.Simulate.change(input)
    spies.onChange.should.have.been.called
  })

  it('should dispatch onPaste on input paste', function () {
    rendered = render(Calculate, props)
    input = TestUtils.findRenderedDOMComponentWithClass(
      rendered,
      'calculator-input'
    )
    TestUtils.Simulate.paste(input)
    spies.onPaste.should.have.been.called
  })

  it('should focus on componentDidUpdate', function () {
    rendered = render(Calculate, props)
    input = TestUtils.findRenderedDOMComponentWithClass(
      rendered,
      'calculator-input'
    )
    input.focus = sinon.spy()
    input.focus.should.not.have.been.called
    rendered.componentDidUpdate()
    input.focus.should.have.been.called
  })

  describe('shouldComponentUpdate', function () {
    it('should not update if calculation and theme are the same', function () {
      const nextProps = { calculation, theme }
      shouldIgnoreOtherProps(rendered, nextProps)
    })

    it('should update if calculation changes', function () {
      const newCalculation = createCalculation('1+12', 13)
      shouldUpdate(rendered, { calculation: newCalculation }).is.true
    })

    it('should not update if theme changes but styles stay the same',
      function () {
        const newTheme = R.merge(theme, { light: '#EEE' })
        shouldUpdate(rendered, { theme: newTheme }).is.false
      }
    )

    it('should update if styles change', function () {
      const newTheme = R.merge(theme, { dark: '#444' })
      shouldUpdate(rendered, { theme: newTheme }).is.true
    })
  })
})
