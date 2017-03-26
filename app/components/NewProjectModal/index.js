import React, { Component } from 'react'
import { bindActionCreators } from 'redux'
import os from 'os'
import path from 'path'
import { connect } from 'react-redux'
import IconArrowRight from 'react-icons/md/arrow-forward'
import IconArrowLeft from 'react-icons/md/arrow-back'
import IconCheck from 'react-icons/md/check-circle'

import * as templates from 'templates'

import { fileDialog } from 'helpers/fs'

import Modal from 'components/Modal'
import Button from 'components/Button'

import TemplateChooser from './TemplateChooser'

import {
  isModalOpened,
  closeModal,
} from 'reducers/modals'

import createFromTemplate from 'actions/createFromTemplate'

import './style.scss'

const HOME_DIR = os.homedir()

const defaultState = {
  projectName: '',
  projectLocation: HOME_DIR,
  // name / template
  step: 'name',
  template: 'singleBasic',
}

@connect(state => ({
  isOpened: isModalOpened(state, 'newProject'),
}), dispatch => ({
  closeModal: () => dispatch(closeModal('newProject')),
  ...bindActionCreators({
    createFromTemplate,
  }, dispatch),
}))
class NewProjectModal extends Component {

  state = defaultState

  componentWillReceiveProps (nextProps) {
    if (this.props.isOpened && !nextProps.isOpened) {

      // prevent flashing the resetted content
      // while animating :D
      setTimeout(() => {
        if (!this.props.isOpened) {
          this.setState(defaultState)
        }
      }, 300)
    }
  }

  componentDidUpdate (prevProps) {
    if (!prevProps.isOpened && this.props.isOpened) {
      this._inputName && this._inputName.focus()
    }
  }

  handleSubmit = e => {
    e.preventDefault()

  }

  handleBrowse = () => {
    const p = fileDialog({
      properties: [
        'openDirectory',
        'createDirectory',
      ],
    })
    if (!p) { return }
    this.setState({ projectLocation: p })
  }

  handleNext = async () => {

    const {
      projectName,
      projectLocation,
      step,
    } = this.state

    const {
      createFromTemplate,
      closeModal,
    } = this.props

    if (step === 'name') {
      this.setState({ step: 'template' })
    }

    if (step === 'template') {

      const fullPath = (projectName && projectLocation)
        ? path.join(projectLocation, projectName)
        : null

      await createFromTemplate(fullPath, templates[this.state.template])
      closeModal()
    }
  }

  handlePrev = () => {
    if (this.state.step === 'template') {
      this.setState({ step: 'name' })
    }
  }

  handleSelectTemplate = template => this.setState({ template })

  render () {

    const {
      isOpened,
      closeModal,
    } = this.props

    const {
      projectName,
      projectLocation,
      step,
      template,
    } = this.state

    const fullPath = (projectName && projectLocation)
      ? path.join(projectLocation, projectName)
      : null

    return (
      <Modal
        className='NewProjectModal'
        isOpened={isOpened}
        onClose={closeModal}
      >
        <form onSubmit={this.handleSubmit}>

          <div className='Modal--label'>
            {'New project'}
          </div>

          {step === 'name' ? (
            <div className='flow-v-20'>
              <div className='d-f ai-b'>
                <div style={{ width: 150 }} className='fs-0'>
                  {'Project name:'}
                </div>
                <input
                  ref={n => this._inputName = n}
                  className='fg-1'
                  value={projectName}
                  onChange={e => this.setState({ projectName: e.target.value })}
                  placeholder='Project name'
                  type='text'
                  autoFocus
                />
              </div>

              <div className='d-f ai-b'>
                <div style={{ width: 150 }} className='fs-0'>
                  {'Location:'}
                </div>
                <div className='fg-1'>
                  <div className='d-f ai-s fg-1'>
                    <input
                      className='fg-1'
                      value={projectLocation}
                      onChange={e => this.setState({ projectLocation: e.target.value })}
                      placeholder='Location'
                      type='text'
                    />
                    <Button ghost onClick={this.handleBrowse} type='button'>
                      {'Browse'}
                    </Button>
                  </div>
                  {fullPath && (
                    <div className='mt-10 t-small'>
                      {'Project will be created at: '}
                      <b className='c-white wb-ba'>
                        {fullPath}
                      </b>
                    </div>
                  )}
                </div>
              </div>

            </div>
          ) : step === 'template' ? (
            <TemplateChooser
              template={template}
              onSelect={this.handleSelectTemplate}
            />
          ) : null}

          <div className='ModalFooter'>
            <Button
              disabled={
                (step === 'name' && (!projectName || !projectLocation))
                || (step === 'template' && !template)
              }
              primary
              onClick={this.handleNext}
            >
              {step === 'template' && <IconCheck className='mr-5' />}
              {step === 'name' && 'Choose template'}
              {step === 'template' && 'Create'}
              {step === 'name' && <IconArrowRight className='ml-10' />}
            </Button>
            {step === 'template' && (
              <Button
                ghost
                onClick={this.handlePrev}
              >
                <IconArrowLeft className='mr-10' />
                {'Choose location and name'}
              </Button>
            )}
            <Button
              transparent
              onClick={closeModal}
            >
              {'Cancel'}
            </Button>
          </div>

        </form>
      </Modal>
    )
  }

}

export default NewProjectModal